const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hr', require('./routes/hrRoutes'));
app.use('/api/trainee', require('./routes/traineeRoutes'));
app.use('/api/trainer', require('./routes/trainerRoutes'));

app.listen(5000, '0.0.0.0', async () => {
  console.log('Server is running on port 5000');
  try {
    await db.query('SELECT 1');
    console.log(`✅ เชื่อมต่อ MySQL สำเร็จ (${process.env.DB_HOST}:${process.env.DB_PORT || 3306})`);
  } catch (err) {
    console.error('❌ เชื่อมต่อ MySQL ไม่ได้:', err.message);
  }
});