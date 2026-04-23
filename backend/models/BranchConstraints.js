const mongoose = require('mongoose');

// Represents a single fixed or alternate class rule
const FixedClassSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    day: { type: String, required: true },
    slot_idx: { type: Number, required: true },
    years: { type: [Number], default: [] },           // e.g. [2, 3, 4] for OE
    sections: { type: [String], default: ['ALL'] },   // e.g. ['A', 'B'] or ['ALL']
    faculty: { type: String, default: '' },
    room: { type: String, default: '' },
    classType: { type: String, enum: ['Fixed', 'Special'], default: 'Fixed' }
});

const AlternateClassSchema = new mongoose.Schema({
    subjectA: { type: String, required: true },        // e.g. "Sports"
    subjectB: { type: String, required: true },        // e.g. "Mentoring"
    day: { type: String, required: true },
    slot_idx: { type: Number, required: true },
    sectionForA: { type: String, default: 'A' },       // Section A gets Sports
    sectionForB: { type: String, default: 'B' },       // Section B gets Mentoring
    years: { type: [Number], default: [] }
});

const BranchConstraintsSchema = new mongoose.Schema({
    department: {
        type: String,
        required: [true, 'Please specify a department'],
        unique: true
    },
    fixedClasses: [FixedClassSchema],
    alternateClasses: [AlternateClassSchema],
    resourceCaps: {
        lectureHalls: { type: Number, default: 5 },
        labs: { type: Number, default: 3 }
    },
    updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BranchConstraints', BranchConstraintsSchema);
