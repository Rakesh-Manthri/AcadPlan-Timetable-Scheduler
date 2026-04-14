const express = require('express');
const { getFaculties, createFaculty } = require('../controllers/faculty');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getFaculties)
    .post(protect, authorize('admin', 'hod'), createFaculty);

module.exports = router;
