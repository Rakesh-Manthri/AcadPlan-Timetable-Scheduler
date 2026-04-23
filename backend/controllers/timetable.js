const axios = require('axios');
const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const BranchConstraints = require('../models/BranchConstraints');
const GlobalScheduleRequest = require('../models/GlobalScheduleRequest');

// ============================================================
// SIMPLE GENERATION (Legacy — single section)
// ============================================================

// @desc    Generate a new timetable (simple mode)
// @route   POST /api/timetable/generate
// @access  Private/Admin
exports.generateTimetable = async (req, res, next) => {
    try {
        const faculties = await Faculty.find();
        const rooms = await Room.find();
        
        if (faculties.length === 0 || rooms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please add Faculty and Rooms first before generating.'
            });
        }

        const courses = [
            { subject: 'Operating Systems', faculty: faculties[0].name, type: 'Lecture' },
            { subject: 'Compiler Design', faculty: faculties[1]?.name || faculties[0].name, type: 'Lecture' },
            { subject: 'Network Security Lab', faculty: faculties[2]?.name || faculties[0].name, type: 'Lab' },
            { subject: 'Database Systems', faculty: faculties[0].name, type: 'Lecture' }
        ];

        const pythonResponse = await axios.post('http://localhost:5001/api/generate', {
            faculties, rooms, courses
        });

        if (pythonResponse.data.status === 'success') {
            const timetable = await Timetable.create({
                academicYear: '2025-26',
                semester: 'Even',
                department: 'IT',
                schedule: pythonResponse.data.data,
                generatedBy: req.user.id
            });

            res.status(201).json({ success: true, data: timetable });
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

// ============================================================
// BRANCH CONSTRAINTS (CRUD)
// ============================================================

// @desc    Get constraints for a department
// @route   GET /api/timetable/constraints/:department
// @access  Private
exports.getConstraints = async (req, res) => {
    try {
        let constraints = await BranchConstraints.findOne({ department: req.params.department });
        if (!constraints) {
            // Return default empty constraints
            constraints = { department: req.params.department, fixedClasses: [], alternateClasses: [], resourceCaps: { lectureHalls: 5, labs: 3 } };
        }
        res.status(200).json({ success: true, data: constraints });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Save/update constraints for a department
// @route   PUT /api/timetable/constraints/:department
// @access  Private/Admin
exports.saveConstraints = async (req, res) => {
    try {
        const { fixedClasses, alternateClasses, resourceCaps } = req.body;
        
        const constraints = await BranchConstraints.findOneAndUpdate(
            { department: req.params.department },
            { fixedClasses, alternateClasses, resourceCaps, updatedBy: req.user.id },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: constraints });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// ============================================================
// WIZARD GENERATION (Multi-Year / Multi-Section)
// ============================================================

// @desc    Generate a full branch schedule via the wizard
// @route   POST /api/timetable/generate-branch
// @access  Private/Admin
exports.generateBranchSchedule = async (req, res) => {
    try {
        const { department, academicYear, semester, years, sections, subjectMappings } = req.body;

        // Fetch live resources
        const faculties = await Faculty.find();
        const rooms = await Room.find();
        const constraints = await BranchConstraints.findOne({ department }) || { fixedClasses: [], alternateClasses: [], resourceCaps: { lectureHalls: 5, labs: 3 } };

        if (rooms.length === 0) {
            return res.status(400).json({ success: false, error: 'No rooms configured. Add rooms first.' });
        }

        // Save request as a record
        const scheduleRequest = await GlobalScheduleRequest.create({
            department, academicYear, semester, years, sections, subjectMappings,
            status: 'pending',
            generatedBy: req.user.id
        });

        // Call the Python solver with all the data
        const pythonResponse = await axios.post('http://localhost:5001/api/generate-branch', {
            faculties,
            rooms,
            subjectMappings,
            fixedClasses: constraints.fixedClasses || [],
            alternateClasses: constraints.alternateClasses || [],
            resourceCaps: constraints.resourceCaps || { lectureHalls: 5, labs: 3 },
            years,
            sections
        }, { timeout: 60000 }); // 60s timeout for complex solves

        if (pythonResponse.data.status === 'success') {
            // Update the request record
            scheduleRequest.status = 'generated';
            scheduleRequest.result = pythonResponse.data.data;
            await scheduleRequest.save();

            // Save each year/section as individual timetables
            const savedTimetables = [];
            for (const [key, schedule] of Object.entries(pythonResponse.data.data)) {
                const tt = await Timetable.create({
                    academicYear, semester, department,
                    schedule: schedule,
                    generatedBy: req.user.id
                });
                savedTimetables.push({ key, timetable: tt });
            }

            res.status(201).json({ 
                success: true, 
                data: pythonResponse.data.data,
                bottleneck: null,
                requestId: scheduleRequest._id
            });
        } else {
            scheduleRequest.status = 'failed';
            scheduleRequest.bottleneck = pythonResponse.data.bottleneck || null;
            await scheduleRequest.save();

            res.status(400).json({ 
                success: false, 
                error: pythonResponse.data.message,
                bottleneck: pythonResponse.data.bottleneck
            });
        }
    } catch (err) {
        console.error('Branch generation error:', err.message);
        res.status(500).json({ 
            success: false, 
            error: err.response?.data?.message || 'Failed to generate branch schedule',
            bottleneck: err.response?.data?.bottleneck || null
        });
    }
};

// @desc    Get a schedule request by ID
// @route   GET /api/timetable/request/:id
// @access  Private
exports.getScheduleRequest = async (req, res) => {
    try {
        const scheduleReq = await GlobalScheduleRequest.findById(req.params.id);
        if (!scheduleReq) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        res.status(200).json({ success: true, data: scheduleReq });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
