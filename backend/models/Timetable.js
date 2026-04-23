const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    schedule: {
        type: Array, // Array of day/slot/room/course assignments
        required: true
    },
    generatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Timetable', TimetableSchema);
