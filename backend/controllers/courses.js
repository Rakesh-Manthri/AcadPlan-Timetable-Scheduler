const Course = require('../models/Course');

// @desc    Get all courses (optionally filter by semester)
// @route   GET /api/courses?semester=3
// @access  Private
exports.getCourses = async (req, res) => {
    try {
        const filter = {};
        if (req.query.semester) {
            filter.semester = parseInt(req.query.semester);
        }
        if (req.query.department) {
            filter.department = req.query.department;
        }

        const courses = await Course.find(filter).sort({ semester: 1, type: 1, name: 1 });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get courses grouped by semester
// @route   GET /api/courses/by-semester
// @access  Private
exports.getCoursesBySemester = async (req, res) => {
    try {
        const courses = await Course.find({ department: req.query.department || 'IT' }).sort({ semester: 1 });

        const grouped = {};
        courses.forEach(c => {
            if (!grouped[c.semester]) grouped[c.semester] = [];
            grouped[c.semester].push(c);
        });

        res.status(200).json({ success: true, data: grouped });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
