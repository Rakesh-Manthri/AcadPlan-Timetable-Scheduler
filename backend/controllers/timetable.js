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
        const { department, academicYear, semester, years, sections, subjectMappings, sectionHalls } = req.body;

        // Fetch live resources
        const faculties = await Faculty.find();
        const rooms = await Room.find();
        const constraints = await BranchConstraints.findOne({ department }) || { fixedClasses: [], alternateClasses: [], resourceCaps: { lectureHalls: 5, labs: 3 } };

        if (rooms.length === 0) {
            return res.status(400).json({ success: false, error: 'No rooms configured. Add rooms first.' });
        }

        // Save request as a record
        const versionName = `Run - ${new Date().toLocaleString()}`;
        const scheduleRequest = await GlobalScheduleRequest.create({
            department, academicYear, semester, years, sections, subjectMappings,
            status: 'draft', // Generated schedules start as draft
            versionName,
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
            sections,
            sectionHalls: sectionHalls || {}
        }, { timeout: 60000 }); // 60s timeout for complex solves

        if (pythonResponse.data.status === 'success') {
            // Update the request record
            scheduleRequest.status = 'draft';
            scheduleRequest.result = pythonResponse.data.data;
            await scheduleRequest.save();

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

// ============================================================
// VERSION MANAGEMENT & HOD APPROVAL
// ============================================================

// @desc    Get all versions for a department
// @route   GET /api/timetable/versions/:department
// @access  Private
exports.getVersions = async (req, res) => {
    try {
        let query = { department: req.params.department };
        if (req.user && req.user.role === 'student') {
            query.status = 'approved';
        }
        
        const versions = await GlobalScheduleRequest.find(query)
            .sort({ createdAt: -1 })
            .populate('generatedBy', 'name role');
        res.status(200).json({ success: true, data: versions });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Submit version to HOD
// @route   PUT /api/timetable/versions/:id/submit
// @access  Private/Admin
exports.submitVersion = async (req, res) => {
    try {
        const version = await GlobalScheduleRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'pending' },
            { new: true }
        );
        res.status(200).json({ success: true, data: version });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Approve version
// @route   PUT /api/timetable/versions/:id/approve
// @access  Private/HOD
exports.approveVersion = async (req, res) => {
    try {
        // First, mark any currently approved version for this department/semester as generated/archived
        const version = await GlobalScheduleRequest.findById(req.params.id);
        if (!version) return res.status(404).json({ success: false, error: 'Version not found' });

        await GlobalScheduleRequest.updateMany(
            { department: version.department, academicYear: version.academicYear, semester: version.semester, status: 'approved' },
            { status: 'generated' }
        );

        // Clear active Timetables for this department/semester and replace with approved ones
        await Timetable.deleteMany({ department: version.department, academicYear: version.academicYear, semester: version.semester });

        if (version.result) {
            for (const [key, schedule] of Object.entries(version.result)) {
                await Timetable.create({
                    academicYear: version.academicYear, 
                    semester: version.semester, 
                    department: version.department,
                    schedule: schedule,
                    generatedBy: req.user.id
                });
            }
        }

        version.status = 'approved';
        version.feedback = null;
        await version.save();

        res.status(200).json({ success: true, data: version });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Reject version
// @route   PUT /api/timetable/versions/:id/reject
// @access  Private/HOD
exports.rejectVersion = async (req, res) => {
    try {
        const { feedback } = req.body;
        const version = await GlobalScheduleRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', feedback },
            { new: true }
        );
        res.status(200).json({ success: true, data: version });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Delete a version
// @route   DELETE /api/timetable/versions/:id
// @access  Private/Admin/HOD
exports.deleteVersion = async (req, res) => {
    try {
        const version = await GlobalScheduleRequest.findById(req.params.id);
        if (!version) {
            return res.status(404).json({ success: false, error: 'Version not found' });
        }
        await version.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Regenerate a specific section in a version
// @route   POST /api/timetable/versions/:id/regenerate-section
// @access  Private/Admin
exports.regenerateSection = async (req, res) => {
    try {
        const { section } = req.body;
        const version = await GlobalScheduleRequest.findById(req.params.id);
        
        if (!version) {
            return res.status(404).json({ success: false, error: 'Version not found' });
        }

        // Fetch current resources
        const faculties = await Faculty.find();
        const rooms = await Room.find();
        const constraints = await BranchConstraints.findOne({ department: version.department }) || { fixedClasses: [], alternateClasses: [] };

        // We only want to solve for this specific section
        // We need to figure out which year this section belongs to
        const yearMatch = version.years.find(y => {
            const yearSections = version.sections[y] || [];
            return yearSections.includes(section);
        });

        if (!yearMatch) {
            return res.status(400).json({ success: false, error: `Section ${section} not found in this version configuration.` });
        }

        const payload = {
            faculties,
            rooms,
            subjectMappings: version.subjectMappings,
            fixedClasses: constraints.fixedClasses || [],
            alternateClasses: constraints.alternateClasses || [],
            resourceCaps: constraints.resourceCaps || { lectureHalls: 5, labs: 3 },
            years: [yearMatch],
            sections: { [yearMatch]: [section] }
        };

        const pythonResponse = await axios.post('http://localhost:5001/api/generate-branch', payload, { timeout: 60000 });

        if (pythonResponse.data.status === 'success') {
            // Update only the specific section in the result
            const newResults = { ...version.result };
            newResults[section] = pythonResponse.data.data[section];
            
            version.result = newResults;
            version.status = 'draft'; // Reset to draft if it was something else
            await version.save();

            res.status(200).json({ success: true, data: version.result });
        } else {
            res.status(500).json({ success: false, error: 'Solver failed to regenerate section' });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
