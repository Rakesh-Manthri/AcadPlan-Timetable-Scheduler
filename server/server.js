// server.js - Updated with all routes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_scheduler');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Server will continue without database. Some features may not work.');
    // process.exit(1); // Commented out to allow server to run without MongoDB
  }
};

connectDB();

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working! 🎉' });
});

// ========== ALL ROUTES ==========
app.use('/api/auth', require('./routes/authRoutes'));        // Login/Register
app.use('/api/rooms', require('./routes/roomRoutes'));       // Room management
app.use('/api/courses', require('./routes/courseRoutes'));   // Course management
app.use('/api/faculty', require('./routes/facultyRoutes'));  // Faculty management
app.use('/api/timetable', require('./routes/timetableRoutes')); // Timetable operations

// Error handling middleware (always last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Test the API at: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Auth routes at: http://localhost:${PORT}/api/auth`);
  console.log(`🏢 Room routes at: http://localhost:${PORT}/api/rooms`);
});