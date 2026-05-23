const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./db/client');
require('./workers/escalationEngine');

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const { authenticateToken } = require('./middleware/auth');
const { runEscalationCheck } = require('./workers/escalationEngine');
const rateLimit = require('express-rate-limit');

// General rate limit — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

// Strict limit for auth routes — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' }
});

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(generalLimiter);
app.use('/api/auth', authLimiter);

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