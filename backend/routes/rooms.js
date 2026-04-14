const express = require('express');
const { getRooms, createRoom } = require('../controllers/rooms');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getRooms)
    .post(protect, authorize('admin'), createRoom);

module.exports = router;
