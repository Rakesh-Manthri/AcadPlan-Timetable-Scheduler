const express = require('express');
const { getFaculties, createFaculty, getProfile, updateProfile } = require('../controllers/faculty');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/me')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.route('/')
    .get(protect, getFaculties)
    .post(protect, authorize('admin', 'hod'), createFaculty);

module.exports = router;
