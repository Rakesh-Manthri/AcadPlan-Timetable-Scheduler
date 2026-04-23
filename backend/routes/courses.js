const express = require('express');
const { getCourses, getCoursesBySemester, createCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getCourses);
router.get('/by-semester', protect, getCoursesBySemester);
router.post('/', protect, authorize('admin', 'hod'), createCourse);
router.put('/:id', protect, authorize('admin', 'hod'), updateCourse);
router.delete('/:id', protect, authorize('admin', 'hod'), deleteCourse);

module.exports = router;
