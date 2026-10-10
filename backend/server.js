const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Route ทดสอบ Login แบบไม่ผ่าน Database ชั่วคราว
app.post('/api/auth/login', (req, res) => {
  console.log('👉 Request reached Backend! Body:', req.body);
  const { username } = req.body;

  return res.json({
    success: true,
    user: {
      userId: 1,
      username: username || 'trainee01',
      fullName: 'Test User',
      role: 'Trainee',
      profileId: 1
    }
  });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});