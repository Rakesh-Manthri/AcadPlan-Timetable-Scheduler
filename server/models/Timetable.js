// Timetable.js - Defines scheduled classes
const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',          // Reference to Course model
    required: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',         // Reference to Faculty model
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',            // Reference to Room model
    required: true,
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  startTime: {
    type: String,           // Format: "09:00"
    required: true,
  },
  endTime: {
    type: String,           // Format: "10:00"
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  academicYear: String,     // e.g., "2024-2025"
}, {
  timestamps: true,
});

module.exports = mongoose.model('Timetable', TimetableSchema);