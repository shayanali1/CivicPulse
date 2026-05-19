const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./db/client');

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const { authenticateToken } = require('./middleware/auth');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test database connection on startup
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to PostgreSQL database at:', result.rows[0].now);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Protected test route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'You are authorized!', 
    user: req.user 
  });
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'CivicPulse API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});