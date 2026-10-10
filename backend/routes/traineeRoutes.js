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
    const [rows] = await db.query('SELECT * FROM TrainingRoadmap WHERE Trainee_ID = ?', [req.params.traineeId]);
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

router.post('/submit', async (req, res) => {
  const { traineeId, assignmentId, fileUrl } = req.body;
  try {
    await db.query(
      'INSERT INTO Submission (Trainee_ID, Assignment_ID, File_URL, Status) VALUES (?, ?, ?, "Submitted")',
      [traineeId, assignmentId, fileUrl]
    );
    res.json({ success: true, message: 'ส่งงานเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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