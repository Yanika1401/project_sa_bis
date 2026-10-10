const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hr', require('./routes/hrRoutes'));
app.use('/api/trainee', require('./routes/traineeRoutes'));
app.use('/api/trainer', require('./routes/trainerRoutes'));

app.listen(5000, '0.0.0.0', () => {
  console.log('Server is running on port 5000');
});