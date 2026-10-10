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
      SELECT s.Submission_ID, t.Name AS TraineeName, a.Title AS AssignmentTitle, s.File_URL, s.SubmittedAt, s.Status
      FROM Submission s
      JOIN Trainee t ON s.Trainee_ID = t.Trainee_ID
      JOIN Assignment a ON s.Assignment_ID = a.Assignment_ID
      WHERE s.Status = "Submitted"
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evaluate', async (req, res) => {
  const { submissionId, trainerId, devScore, bizScore, commScore, status, feedbackNote } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [evalResult] = await conn.query(`
      INSERT INTO Evaluation (Submission_ID, Trainer_ID, Development_Score, BusinessLogic_Score, Communication_Score, Status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [submissionId, trainerId, devScore, bizScore, commScore, status]);

    await conn.query(`
      INSERT INTO Feedback (Evaluation_ID, Feedback_Note) VALUES (?, ?)
    `, [evalResult.insertId, feedbackNote]);

    await conn.query('UPDATE Submission SET Status = "Graded" WHERE Submission_ID = ?', [submissionId]);

    await conn.commit();
    res.json({ success: true, message: 'ประเมินผลและบันทึก Feedback สำเร็จ' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;