const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.User_ID, u.Username, 
             COALESCE(t.Name, tr.Name, h.Name) AS Name,
             CASE 
               WHEN t.Trainee_ID IS NOT NULL THEN 'Trainee'
               WHEN tr.Trainer_ID IS NOT NULL THEN 'Trainer'
               WHEN h.Hr_ID IS NOT NULL THEN 'HR'
             END AS Role
      FROM User u
      LEFT JOIN Trainee t ON u.User_ID = t.User_ID
      LEFT JOIN TrainerBA tr ON u.User_ID = tr.User_ID
      LEFT JOIN HR h ON u.User_ID = h.User_ID
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/probation-report', async (req, res) => {
  const { traineeId, hrId, status, remark } = req.body;
  try {
    await db.query(
      'INSERT INTO ProbationReport (Trainee_ID, Hr_ID, Status, Remark) VALUES (?, ?, ?, ?)',
      [traineeId, hrId, status, remark]
    );
    res.json({ success: true, message: 'บันทึกรายงาน Probation Report สำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;