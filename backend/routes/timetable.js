const express = require('express');
const { 
    generateTimetable, 
    getLatestTimetable,
    getConstraints,
    saveConstraints,
    generateBranchSchedule,
    getScheduleRequest
} = require('../controllers/timetable');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Legacy simple generation
router.get('/latest', protect, getLatestTimetable);
router.post('/generate', protect, authorize('admin', 'hod'), generateTimetable);

// Branch constraints (CRUD)
router.get('/constraints/:department', protect, getConstraints);
router.put('/constraints/:department', protect, authorize('admin', 'hod'), saveConstraints);

// Wizard: Multi-year branch generation
router.post('/generate-branch', protect, authorize('admin', 'hod'), generateBranchSchedule);
router.get('/request/:id', protect, getScheduleRequest);

module.exports = router;
