const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('👉 [Auth] Processing login for:', username);

  try {
    const [users] = await db.query(
      'SELECT User_ID, Username FROM User WHERE Username = ? AND Password = ?',
      [username, password]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = users[0];

    const [trainees] = await db.query('SELECT Trainee_ID AS profileId, Name FROM Trainee WHERE User_ID = ?', [user.User_ID]);
    const [trainers] = await db.query('SELECT Trainer_ID AS profileId, Name FROM TrainerBA WHERE User_ID = ?', [user.User_ID]);
    const [hrs] = await db.query('SELECT Hr_ID AS profileId, Name FROM HR WHERE User_ID = ?', [user.User_ID]);

    let role = 'Unknown';
    let fullName = user.Username;
    let profileId = null;

    if (trainees.length > 0) {
      role = 'Trainee';
      fullName = trainees[0].Name;
      profileId = trainees[0].profileId;
    } else if (trainers.length > 0) {
      role = 'Trainer';
      fullName = trainers[0].Name;
      profileId = trainers[0].profileId;
    } else if (hrs.length > 0) {
      role = 'HR';
      fullName = hrs[0].Name;
      profileId = hrs[0].profileId;
    }

    return res.json({
      success: true,
      user: { userId: user.User_ID, username: user.Username, fullName, role, profileId }
    });

  } catch (err) {
    console.error('❌ [Auth Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;