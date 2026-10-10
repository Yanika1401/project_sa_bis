const express = require('express');
const router = express.Router();
const db = require('../config/db');

const ROLE_TABLE = {
  Trainee: { table: 'Trainee', cols: '(User_ID, Name, Start_Date)', vals: '(?, ?, CURDATE())' },
  Trainer: { table: 'TrainerBA', cols: '(User_ID, Name)', vals: '(?, ?)' },
  HR: { table: 'HR', cols: '(User_ID, Name)', vals: '(?, ?)' }
};

// รายชื่อผู้ใช้ทั้งหมด
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.User_ID, u.Username, 
             COALESCE(t.Name, tr.Name, h.Name) AS Name,
             CASE 
               WHEN t.Trainee_ID IS NOT NULL THEN 'Trainee'
               WHEN tr.Trainer_ID IS NOT NULL THEN 'Trainer'
               WHEN h.Hr_ID IS NOT NULL THEN 'HR'
               ELSE 'Unknown'
             END AS Role
      FROM User u
      LEFT JOIN Trainee t ON u.User_ID = t.User_ID
      LEFT JOIN TrainerBA tr ON u.User_ID = tr.User_ID
      LEFT JOIN HR h ON u.User_ID = h.User_ID
      ORDER BY u.User_ID
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ [HR Users Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// เพิ่มผู้ใช้
router.post('/users', async (req, res) => {
  const { username, password, name, role } = req.body;
  const cfg = ROLE_TABLE[role];
  if (!username || !password || !name || !cfg) {
    return res.status(400).json({ success: false, message: 'กรอกข้อมูลไม่ครบ' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO User (Username, Password) VALUES (?, ?)',
      [username, password]
    );
    await conn.query(`INSERT INTO ${cfg.table} ${cfg.cols} VALUES ${cfg.vals}`, [r.insertId, name]);
    await conn.commit();
    res.status(201).json({ success: true, userId: r.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Username นี้ถูกใช้แล้ว' });
    }
    console.error('❌ [HR Add User Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// แก้ไขผู้ใช้ (ชื่อ และรหัสผ่านถ้ากรอก)
router.put('/users/:id', async (req, res) => {
  const { name, password } = req.body;
  const id = req.params.id;
  if (!name) return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อ' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (password) {
      await conn.query('UPDATE User SET Password = ? WHERE User_ID = ?', [password, id]);
    }
    for (const { table } of Object.values(ROLE_TABLE)) {
      await conn.query(`UPDATE ${table} SET Name = ? WHERE User_ID = ?`, [name, id]);
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error('❌ [HR Edit User Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// บันทึก Probation Report (เหมือนเดิม)
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