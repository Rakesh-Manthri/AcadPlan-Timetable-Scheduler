const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a course code'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please add a course name'],
        trim: true
    },
    semester: {
        type: Number,
        required: true
    },
    weeklyHours: {
        type: Number,
        required: true,
        default: 3
    },
    type: {
        type: String,
        enum: ['Lecture', 'Lab', 'Project', 'Seminar'],
        default: 'Lecture'
    },
    department: {
        type: String,
        default: 'IT'
    },
    credits: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', CourseSchema);
