const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please add a faculty name'],
        trim: true
    },
    designation: {
        type: String,
        enum: ['Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'],
        default: 'Assistant Professor'
    },
    qualifications: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        required: [true, 'Please specify a department']
    },
    specialization: {
        type: [String],
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    maxWeeklyLoad: {
        type: Number,
        default: 16
    },
    availability: {
        type: Object,
        default: {
            Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Faculty', FacultySchema);
