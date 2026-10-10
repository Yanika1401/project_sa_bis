const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'training_management_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000 // ตัด Connection ทันทีถ้าผ่านไป 5 วินาทีแล้วตอบสนองไม่ได้
});

module.exports = pool;