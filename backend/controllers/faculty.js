const Faculty = require('../models/Faculty');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private
exports.getFaculties = async (req, res, next) => {
    try {
        const faculties = await Faculty.find();
        res.status(200).json({ success: true, count: faculties.length, data: faculties });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new faculty
// @route   POST /api/faculty
// @access  Private/Admin/HOD
exports.createFaculty = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        const faculty = await Faculty.create(req.body);
        res.status(201).json({ success: true, data: faculty });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current faculty profile
// @route   GET /api/faculty/me
// @access  Private/Faculty
exports.getProfile = async (req, res, next) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) {
            return res.status(404).json({ success: false, error: 'Faculty profile not found' });
        }
        res.status(200).json({ success: true, data: faculty });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update current faculty profile
// @route   PUT /api/faculty/me
// @access  Private/Faculty
exports.updateProfile = async (req, res, next) => {
    try {
        const { education, publications, conferences } = req.body;
        
        let faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) {
            return res.status(404).json({ success: false, error: 'Faculty profile not found' });
        }

        faculty = await Faculty.findByIdAndUpdate(
            faculty._id,
            { education, publications, conferences },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: faculty });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
