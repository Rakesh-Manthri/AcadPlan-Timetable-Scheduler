const express = require('express');
const { 
    generateTimetable, 
    getLatestTimetable,
    getConstraints,
    saveConstraints,
    generateBranchSchedule,
    getScheduleRequest,
    getVersions,
    submitVersion,
    approveVersion,
    rejectVersion,
    deleteVersion,
    regenerateSection
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
router.post('/generate-branch', protect, authorize('admin'), generateBranchSchedule);
router.get('/request/:id', protect, getScheduleRequest);

// Version Management & HOD Approval
router.get('/versions/:department', protect, getVersions);
router.put('/versions/:id/submit', protect, authorize('admin'), submitVersion);
router.put('/versions/:id/approve', protect, authorize('hod'), approveVersion);
router.put('/versions/:id/reject', protect, authorize('hod'), rejectVersion);
router.delete('/versions/:id', protect, authorize('admin', 'hod'), deleteVersion);
router.post('/versions/:id/regenerate-section', protect, authorize('admin'), regenerateSection);

module.exports = router;
