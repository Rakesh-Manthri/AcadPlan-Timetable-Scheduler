// Room.js - Defines classrooms
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,        // Each room has a unique number
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,              // Minimum capacity is 1
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'seminar', 'auditorium'],
    required: true,
  },
  facilities: [String],  // Array of strings like ['projector', 'AC']
  availability: {
    type: Boolean,
    default: true,       // Room is available by default
  },
  building: String,      // Which building
  floor: Number,         // Which floor
}, {
  timestamps: true,      // Automatically add createdAt and updatedAt
});

module.exports = mongoose.model('Room', RoomSchema);