const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const householdRoutes = require('./routes/householdRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const profileRoutes = require('./routes/profileRoutes');
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware

// CORS configuration - Allow GitHub Pages and localhost
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://rubysage20.github.io'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/households', require('./routes/householdRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/password', require('./routes/passwordRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'HomeFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});