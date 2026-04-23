const express = require('express');
const { generateTimetable, getLatestTimetable } = require('../controllers/timetable');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/latest', protect, getLatestTimetable);
router.post('/generate', protect, authorize('admin', 'hod'), generateTimetable);

module.exports = router;
