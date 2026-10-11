const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'training_management_db',
  charset: 'utf8mb4',
  // คืนค่าวันที่เป็นสตริง 'YYYY-MM-DD' กันวันที่เพี้ยนเมื่อ server กับเครื่องเราอยู่คนละ timezone
  dateStrings: true,
  // เปิดเมื่อใช้ MySQL สำเร็จรูปที่บังคับ SSL
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

module.exports = pool;