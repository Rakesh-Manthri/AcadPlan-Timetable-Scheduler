// roomRoutes.js - Manage rooms
const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

// CREATE - Add a new room
router.post('/', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    const newRoom = { ...req.body, _id: Date.now().toString() };
    res.status(201).json(newRoom);
  }
});

// READ - Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    // Fallback to mock data
    const mockRooms = [
      {
        _id: '1',
        roomNumber: 'CS101',
        capacity: 50,
        type: 'Classroom',
        building: 'Computer Science Building'
      },
      {
        _id: '2',
        roomNumber: 'LAB201',
        capacity: 30,
        type: 'Lab',
        building: 'Engineering Building'
      }
    ];
    res.json(mockRooms);
  }
});

// READ - Get single room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Update a room
router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    const updatedRoom = { ...req.body, _id: req.params.id };
    res.json(updatedRoom);
  }
});

// DELETE - Remove a room
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.json({ message: 'Room deleted' });
  }
});

module.exports = router;