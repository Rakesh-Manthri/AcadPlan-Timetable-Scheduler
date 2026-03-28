// Faculty.js - Defines teachers
const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  designation: String,     // Professor, Associate Professor, etc.
  courses: [String],        // Array of course codes they can teach
  maxHoursPerDay: {
    type: Number,
    default: 6,             // Max 6 hours of teaching per day
  },
  email: String,
  phone: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Faculty', FacultySchema);