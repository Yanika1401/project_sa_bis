const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/dashboard/:traineeId', async (req, res) => {
  try {
    const [roadmap] = await db.query('SELECT * FROM TrainingRoadmap WHERE Trainee_ID = ? LIMIT 1', [req.params.traineeId]);
    const [assignments] = await db.query('SELECT * FROM Assignment');
    res.json({ roadmap: roadmap[0] || null, assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/roadmap/:traineeId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT Roadmap_ID, Trainee_ID, Trainer_ID, Title, Description, Status,
              Start_Date AS StartDate, End_Date AS EndDate
       FROM TrainingRoadmap WHERE Trainee_ID = ?`,
      [req.params.traineeId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/assignments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Assignment');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ส่งงาน: สร้าง Submission (Version ถัดไป) + SubmissionFile ในธุรกรรมเดียว
router.post('/submit', async (req, res) => {
  const { traineeId, assignmentId, fileUrl } = req.body;
  if (!traineeId || !assignmentId || !fileUrl) {
    return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบ' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[v]] = await conn.query(
      `SELECT COALESCE(MAX(Version_No), 0) + 1 AS nextVersion
       FROM Submission WHERE Trainee_ID = ? AND Assignment_ID = ?`,
      [traineeId, assignmentId]
    );

    const [r] = await conn.query(
      `INSERT INTO Submission (Trainee_ID, Assignment_ID, Version_No, Status)
       VALUES (?, ?, ?, 'Submitted')`,
      [traineeId, assignmentId, v.nextVersion]
    );

    await conn.query(
      `INSERT INTO SubmissionFile (Submission_ID, File_Type, File_URL)
       VALUES (?, 'URL', ?)`,
      [r.insertId, fileUrl]
    );

    await conn.commit();
    res.json({ success: true, message: 'ส่งงานเรียบร้อยแล้ว' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

router.get('/evaluations/:traineeId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.Submission_ID, a.Title, e.Development_Score, e.BusinessLogic_Score, e.Communication_Score, e.Status, f.Feedback_Note
      FROM Submission s
      JOIN Assignment a ON s.Assignment_ID = a.Assignment_ID
      LEFT JOIN Evaluation e ON s.Submission_ID = e.Submission_ID
      LEFT JOIN Feedback f ON e.Evaluation_ID = f.Evaluation_ID
      WHERE s.Trainee_ID = ?
    `, [req.params.traineeId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;