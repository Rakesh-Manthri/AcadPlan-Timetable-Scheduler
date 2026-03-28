// Course.js - Defines courses/subjects
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,      // Convert to uppercase automatically
  },
  courseName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  theoryHours: Number,    // Hours of theory classes per week
  labHours: Number,       // Hours of lab classes per week
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', CourseSchema);