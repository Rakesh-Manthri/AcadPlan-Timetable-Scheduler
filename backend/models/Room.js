const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: [true, 'Please add a room identifier'],
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Lecture Hall', 'Computer Lab', 'Specialized Lab', 'Auditorium'],
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    facilities: {
        type: [String],
        default: []
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema);
