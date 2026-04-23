const mongoose = require('mongoose');

const SubjectMappingSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    faculty: { type: String, required: true },
    weeklyHours: { type: Number, required: true, default: 3 },
    type: { type: String, enum: ['Lecture', 'Lab'], default: 'Lecture' },
    year: { type: Number, required: true },
    section: { type: String, default: 'A' }
});

const GlobalScheduleRequestSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true,
        default: '2025-26'
    },
    semester: {
        type: String,
        required: true,
        default: 'Even'
    },
    years: {
        type: [Number],
        default: [2, 3, 4]
    },
    sections: {
        type: [String],
        default: ['A']
    },
    subjectMappings: [SubjectMappingSchema],
    status: {
        type: String,
        enum: ['draft', 'pending', 'generated', 'approved', 'failed'],
        default: 'draft'
    },
    result: {
        type: mongoose.Schema.Types.Mixed,   // Multi-year schedule or bottleneck analysis
        default: null
    },
    bottleneck: {
        type: mongoose.Schema.Types.Mixed,   // Bottleneck analysis when failed
        default: null
    },
    generatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GlobalScheduleRequest', GlobalScheduleRequestSchema);
