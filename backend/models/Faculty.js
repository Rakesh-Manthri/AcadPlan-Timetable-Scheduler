const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a faculty name'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Please specify a department']
    },
    specialization: {
        type: [String],
        required: true
    },
    maxWeeklyLoad: {
        type: Number,
        default: 16
    },
    availability: {
        // Simple mapping of Day: [Hours] or specialized constraint object
        type: Object,
        default: {
            Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Faculty', FacultySchema);
