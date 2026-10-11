const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/trainees', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Trainee');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/submissions', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.Submission_ID,
             t.Name AS TraineeName,
             a.Title AS AssignmentTitle,
             s.Version_No,
             (SELECT sf.File_URL FROM SubmissionFile sf
               WHERE sf.Submission_ID = s.Submission_ID
               ORDER BY sf.File_ID LIMIT 1) AS File_URL,
             s.Submitted_At AS SubmittedAt,
             s.Status
      FROM Submission s
      JOIN Trainee t ON s.Trainee_ID = t.Trainee_ID
      JOIN Assignment a ON s.Assignment_ID = a.Assignment_ID
      WHERE s.Status = 'Submitted'
      ORDER BY s.Submitted_At
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// บันทึกผลประเมิน + Feedback + ปรับสถานะบทเรียนในแผน (ปลดล็อกบทถัดไปเมื่อผ่าน)
router.post('/evaluate', async (req, res) => {
  const { submissionId, trainerId, status, feedbackNote } = req.body;
  const scores = [req.body.devScore, req.body.bizScore, req.body.commScore].map(Number);

  const fail = (code, message) => res.status(code).json({ success: false, error: message, message });

  if (!submissionId || !trainerId) return fail(400, 'ข้อมูลไม่ครบ');
  if (scores.some((s) => !Number.isInteger(s) || s < 1 || s > 4)) {
    return fail(400, 'คะแนนแต่ละด้านต้องเป็นจำนวนเต็ม 1 ถึง 4');
  }
  if (!['Passed', 'Need_Revision'].includes(status)) return fail(400, 'สถานะต้องเป็น Passed หรือ Need_Revision');
  if (!feedbackNote || !String(feedbackNote).trim()) return fail(400, 'กรุณากรอก Feedback');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [subRows] = await conn.query(
      'SELECT Trainee_ID, Assignment_ID, Status FROM Submission WHERE Submission_ID = ? FOR UPDATE',
      [submissionId]
    );
    const sub = subRows[0];
    if (!sub) {
      await conn.rollback();
      return fail(404, 'ไม่พบการส่งงานนี้');
    }
    if (sub.Status === 'Graded') {
      await conn.rollback();
      return fail(409, 'การส่งงานนี้ถูกประเมินไปแล้ว');
    }

    const [evalResult] = await conn.query(
      `INSERT INTO Evaluation (Submission_ID, Trainer_ID, Development_Score, BusinessLogic_Score, Communication_Score, Status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [submissionId, trainerId, scores[0], scores[1], scores[2], status]
    );
    await conn.query('INSERT INTO Feedback (Evaluation_ID, Feedback_Note) VALUES (?, ?)', [
      evalResult.insertId,
      String(feedbackNote).trim()
    ]);
    await conn.query("UPDATE Submission SET Status = 'Graded' WHERE Submission_ID = ?", [submissionId]);

    if (status === 'Passed') {
      const [itemRows] = await conn.query(
        `SELECT ri.Item_ID, ri.Roadmap_ID, ri.Seq_No
         FROM RoadmapItem ri
         JOIN TrainingRoadmap r ON r.Roadmap_ID = ri.Roadmap_ID
         WHERE r.Trainee_ID = ? AND ri.Assignment_ID = ?`,
        [sub.Trainee_ID, sub.Assignment_ID]
      );
      const item = itemRows[0];
      if (item) {
        await conn.query("UPDATE RoadmapItem SET Status = 'Completed' WHERE Item_ID = ?", [item.Item_ID]);
        // เปิดบทถัดไปให้เริ่มเรียน (BR-3)
        await conn.query(
          "UPDATE RoadmapItem SET Status = 'In_Progress' WHERE Roadmap_ID = ? AND Seq_No = ? AND Status = 'Not_Started'",
          [item.Roadmap_ID, item.Seq_No + 1]
        );
        const [left] = await conn.query(
          "SELECT COUNT(*) AS remaining FROM RoadmapItem WHERE Roadmap_ID = ? AND Status <> 'Completed'",
          [item.Roadmap_ID]
        );
        if (Number(left[0].remaining) === 0) {
          await conn.query("UPDATE TrainingRoadmap SET Status = 'Completed' WHERE Roadmap_ID = ?", [item.Roadmap_ID]);
        }
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'ประเมินผลและบันทึก Feedback สำเร็จ' });
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    res.status(500).json({ success: false, error: err.message, message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;