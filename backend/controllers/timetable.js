const axios = require('axios');
const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');

// @desc    Generate a new timetable
// @route   POST /api/timetable/generate
// @access  Private/Admin
exports.generateTimetable = async (req, res, next) => {
    try {
        // 1. Fetch live data
        const faculties = await Faculty.find();
        const rooms = await Room.find();
        
        if (faculties.length === 0 || rooms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please add Faculty and Rooms first before generating.'
            });
        }

        // 2. Create dynamic courses based on existing faculty
        // This ensures the solver always finds the faculty meta
        const courses = [
            { subject: 'Operating Systems', faculty: faculties[0].name, type: 'Lecture' },
            { subject: 'Compiler Design', faculty: faculties[1]?.name || faculties[0].name, type: 'Lecture' },
            { subject: 'Network Security Lab', faculty: faculties[2]?.name || faculties[0].name, type: 'Lab' },
            { subject: 'Database Systems', faculty: faculties[0].name, type: 'Lecture' }
        ];

        // 2. Call the Python Scheduler Microservice
        const pythonResponse = await axios.post('http://localhost:5001/api/generate', {
            faculties,
            rooms,
            courses
        });

        if (pythonResponse.data.status === 'success') {
            // 3. Save the result to MongoDB
            const timetable = await Timetable.create({
                academicYear: '2025-26',
                semester: 'Even',
                department: 'IT',
                schedule: pythonResponse.data.data,
                generatedBy: req.user.id
            });

            res.status(201).json({
                success: true,
                data: timetable
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false, 
            error: err.response?.data?.message || 'Failed to generate timetable' 
        });
    }
};

// @desc    Get latest timetable
// @route   GET /api/timetable/latest
// @access  Private
exports.getLatestTimetable = async (req, res, next) => {
    try {
        const timetable = await Timetable.findOne().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: timetable });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
