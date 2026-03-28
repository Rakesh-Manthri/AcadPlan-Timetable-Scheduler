// timetableRoutes.js
const express = require('express');
const { 
  createTimetableEntry, 
  getTimetable, 
  generateAutomaticTimetable,
  deleteTimetableEntry
} = require('../controllers/timetableController');
const router = express.Router();

router.post('/create', createTimetableEntry);      // POST /api/timetable/create
router.get('/', getTimetable);                      // GET /api/timetable
router.post('/generate', generateAutomaticTimetable); // POST /api/timetable/generate
router.delete('/:id', deleteTimetableEntry);        // DELETE /api/timetable/:id

module.exports = router;