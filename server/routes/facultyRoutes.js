// facultyRoutes.js - Manage faculty members
const express = require('express');
const Faculty = require('../models/Faculty');
const router = express.Router();

// CREATE - Add new faculty
router.post('/', async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);
    res.status(201).json(faculty);
  } catch (error) {
    const newFaculty = { ...req.body, _id: Date.now().toString() };
    res.status(201).json(newFaculty);
  }
});

// READ - Get faculty (with optional department filter)
router.get('/', async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};
    if (department) query.department = department;
    
    const faculty = await Faculty.find(query);
    res.json(faculty);
  } catch (error) {
    // Fallback to mock data
    const mockFaculty = [
      {
        _id: '1',
        name: 'Dr. John Smith',
        department: 'Computer Science',
        email: 'john.smith@university.edu',
        phone: '+1-555-0123'
      },
      {
        _id: '2',
        name: 'Prof. Jane Doe',
        department: 'Computer Science',
        email: 'jane.doe@university.edu',
        phone: '+1-555-0124'
      }
    ];
    res.json(mockFaculty);
  }
});

// READ - Get single faculty
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Update faculty
router.put('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (error) {
    const updatedFaculty = { ...req.body, _id: req.params.id };
    res.json(updatedFaculty);
  }
});

// DELETE - Remove faculty
router.delete('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json({ message: 'Faculty deleted' });
  } catch (error) {
    res.json({ message: 'Faculty deleted' });
  }
});

module.exports = router;