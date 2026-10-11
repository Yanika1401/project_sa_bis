const express = require('express');
const router = express.Router();
const db = require('../config/db');

const parseFiles = (v) => {
  if (!v) return [];
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return []; }
  }
  return v;
};

// โหลดแผนการเรียนรู้ + บทเรียนทุกบท + ประวัติการส่งงาน/ผลประเมินของ Trainee
async function loadLearning(traineeId) {
  const [rm] = await db.query(
    `SELECT r.*, t.Name AS Trainer_Name
     FROM TrainingRoadmap r
     JOIN TrainerBA t ON t.Trainer_ID = r.Trainer_ID
     WHERE r.Trainee_ID = ?
     ORDER BY r.Roadmap_ID DESC LIMIT 1`,
    [traineeId]
  );
  const roadmap = rm[0] || null;
  if (!roadmap) return { roadmap: null, items: [] };

  // Unlocked: Seq_No = 1 เข้าได้เสมอ, บทอื่นเข้าได้เมื่อบทก่อนหน้า Completed (BR-3)
  const [items] = await db.query(
    `SELECT ri.Item_ID, ri.Seq_No, ri.Status AS ItemStatus, ri.Assignment_ID,
            a.Title, a.Description, a.Category, a.Difficulty_Level, a.Deadline,
            m.Material_ID, m.Title AS MaterialTitle, m.Type AS MaterialType,
            m.Description AS MaterialDescription, m.Material_URL,
            (ri.Seq_No = 1 OR EXISTS (
               SELECT 1 FROM RoadmapItem prev
               WHERE prev.Roadmap_ID = ri.Roadmap_ID
                 AND prev.Seq_No = ri.Seq_No - 1
                 AND prev.Status = 'Completed')) AS Unlocked
     FROM RoadmapItem ri
     JOIN Assignment a ON a.Assignment_ID = ri.Assignment_ID
     JOIN LearningMaterial m ON m.Material_ID = a.Material_ID
     WHERE ri.Roadmap_ID = ?
     ORDER BY ri.Seq_No`,
    [roadmap.Roadmap_ID]
  );

  const [subs] = await db.query(
    `SELECT s.Submission_ID, s.Assignment_ID, s.Version_No, s.Submitted_At,
            s.Status AS SubmissionStatus,
            e.Evaluation_ID, e.Development_Score, e.BusinessLogic_Score, e.Communication_Score,
            e.Status AS EvalStatus, f.Feedback_Note, tr.Name AS Trainer_Name,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', sf.File_Name, 'type', sf.File_Type, 'url', sf.File_URL))
               FROM SubmissionFile sf WHERE sf.Submission_ID = s.Submission_ID) AS Files
     FROM Submission s
     LEFT JOIN Evaluation e ON e.Submission_ID = s.Submission_ID
     LEFT JOIN Feedback f ON f.Evaluation_ID = e.Evaluation_ID
     LEFT JOIN TrainerBA tr ON tr.Trainer_ID = e.Trainer_ID
     WHERE s.Trainee_ID = ?
     ORDER BY s.Assignment_ID, s.Version_No`,
    [traineeId]
  );

  const decorated = items.map((it) => {
    const mine = subs
      .filter((s) => s.Assignment_ID === it.Assignment_ID)
      .map((s) => ({ ...s, Files: parseFiles(s.Files) }));
    const latest = mine.length ? mine[mine.length - 1] : null;
    const unlocked = !!it.Unlocked;

    // submitMode: 'new' = ส่งครั้งแรก, 'resubmit' = ส่งแก้ไข, null = ส่งไม่ได้ (ดู blockReason)
    let submitMode = null;
    let blockReason = null;
    if (!unlocked) blockReason = 'LOCKED';
    else if (it.ItemStatus === 'Completed' || (latest && latest.EvalStatus === 'Passed')) blockReason = 'COMPLETED';
    else if (latest && !latest.EvalStatus) blockReason = 'WAITING';
    else submitMode = latest ? 'resubmit' : 'new';

    return { ...it, Unlocked: unlocked, submissions: mine, latest, submitMode, blockReason };
  });

  return { roadmap, items: decorated };
}

router.get('/dashboard/:traineeId', async (req, res) => {
  try {
    const id = req.params.traineeId;
    const [tr] = await db.query(
      'SELECT Name, Position, Start_Date, Skill_Level FROM Trainee WHERE Trainee_ID = ?', [id]
    );
    const learning = await loadLearning(id);
    const [avgRows] = await db.query(
      `SELECT COUNT(*) AS cnt,
              AVG(e.Development_Score) AS dev,
              AVG(e.BusinessLogic_Score) AS biz,
              AVG(e.Communication_Score) AS comm
       FROM Evaluation e
       JOIN Submission s ON s.Submission_ID = e.Submission_ID
       WHERE s.Trainee_ID = ?`,
      [id]
    );
    const a = avgRows[0];
    const averages = {
      count: Number(a.cnt),
      dev: a.dev === null ? null : Number(a.dev),
      biz: a.biz === null ? null : Number(a.biz),
      comm: a.comm === null ? null : Number(a.comm)
    };
    res.json({ trainee: tr[0] || null, ...learning, averages });
  } catch (err) {
    res.status(500).json({ error: err.message, message: err.message });
  }
});

// เส้นทางการเรียนรู้ และหน้าสื่อ/แบบฝึกหัด ใช้ข้อมูลชุดเดียวกัน
router.get('/roadmap/:traineeId', async (req, res) => {
  try {
    res.json(await loadLearning(req.params.traineeId));
  } catch (err) {
    res.status(500).json({ error: err.message, message: err.message });
  }
});

router.get('/assignments/:traineeId', async (req, res) => {
  try {
    res.json(await loadLearning(req.params.traineeId));
  } catch (err) {
    res.status(500).json({ error: err.message, message: err.message });
  }
});

// ส่งงาน: แนบได้หลายลิงก์ในการส่งครั้งเดียว, ส่งซ้ำ = Version ถัดไป
router.post('/submit', async (req, res) => {
  const { traineeId, assignmentId } = req.body;
  let files = req.body.files;
  if (!files && req.body.fileUrl) files = [{ url: req.body.fileUrl }];

  if (!traineeId || !assignmentId || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ success: false, message: 'กรุณาแนบลิงก์ผลงานอย่างน้อย 1 รายการ' });
  }
  if (files.length > 10) {
    return res.status(400).json({ success: false, message: 'แนบได้ไม่เกิน 10 รายการต่อการส่งหนึ่งครั้ง' });
  }
  const bad = files.find((f) => !/^https?:\/\/\S+$/i.test(String(f.url || '').trim()));
  if (bad) {
    return res.status(400).json({ success: false, message: 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://' });
  }

  const conn = await db.getConnection();
  try {
    const { roadmap, items } = await loadLearning(traineeId);
    const item = items.find((i) => i.Assignment_ID === Number(assignmentId));
    if (!roadmap || !item) {
      return res.status(403).json({ success: false, message: 'โจทย์นี้ไม่ได้อยู่ในแผนการเรียนรู้ของคุณ' });
    }
    if (!item.submitMode) {
      const msg = {
        LOCKED: 'บทนี้ยังไม่ปลดล็อก กรุณาทำบทก่อนหน้าให้ผ่านก่อน',
        COMPLETED: 'บทนี้ผ่านการประเมินแล้ว',
        WAITING: 'งานของคุณอยู่ระหว่างรอตรวจ ไม่สามารถส่งซ้ำได้'
      }[item.blockReason];
      return res.status(409).json({ success: false, message: msg });
    }

    await conn.beginTransaction();
    const nextVersion = item.latest ? item.latest.Version_No + 1 : 1;

    const [r] = await conn.query(
      `INSERT INTO Submission (Trainee_ID, Assignment_ID, Version_No, Status)
       VALUES (?, ?, ?, 'Submitted')`,
      [traineeId, assignmentId, nextVersion]
    );
    for (const f of files) {
      await conn.query(
        `INSERT INTO SubmissionFile (Submission_ID, File_Name, File_Type, File_URL)
         VALUES (?, ?, 'URL', ?)`,
        [r.insertId, f.name ? String(f.name).slice(0, 255) : null, String(f.url).trim()]
      );
    }
    await conn.query("UPDATE RoadmapItem SET Status = 'In_Progress' WHERE Item_ID = ?", [item.Item_ID]);
    await conn.query(
      "UPDATE TrainingRoadmap SET Status = 'In_Progress' WHERE Roadmap_ID = ? AND Status = 'Not_Started'",
      [roadmap.Roadmap_ID]
    );
    await conn.commit();

    res.json({
      success: true,
      message: nextVersion > 1 ? `ส่งงานแก้ไขเรียบร้อย (ครั้งที่ ${nextVersion})` : 'ส่งงานเรียบร้อยแล้ว'
    });
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// ผลประเมินทุกการส่งงาน (รวมรายการที่ยังรอตรวจ)
router.get('/evaluations/:traineeId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.Submission_ID, a.Assignment_ID, a.Title, a.Category, s.Version_No, s.Submitted_At,
              s.Status AS Submission_Status,
              e.Evaluation_ID, e.Development_Score, e.BusinessLogic_Score, e.Communication_Score,
              e.Status, f.Feedback_Note, f.Created_At AS Feedback_At, tr.Name AS Trainer_Name
       FROM Submission s
       JOIN Assignment a ON a.Assignment_ID = s.Assignment_ID
       LEFT JOIN Evaluation e ON e.Submission_ID = s.Submission_ID
       LEFT JOIN Feedback f ON f.Evaluation_ID = e.Evaluation_ID
       LEFT JOIN TrainerBA tr ON tr.Trainer_ID = e.Trainer_ID
       WHERE s.Trainee_ID = ?
       ORDER BY s.Submitted_At DESC, s.Submission_ID DESC`,
      [req.params.traineeId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message, message: err.message });
  }
});

module.exports = router;