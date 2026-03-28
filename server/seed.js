const mongoose = require('mongoose');
const Room = require('./models/Room');
const Course = require('./models/Course');
const Faculty = require('./models/Faculty');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/timetable_scheduler');
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Room.deleteMany({});
    await Course.deleteMany({});
    await Faculty.deleteMany({});
    await User.deleteMany({});
    
    // Add sample rooms
    await Room.insertMany([
      { roomNumber: '101', capacity: 60, type: 'lecture', facilities: ['projector'], building: 'Main' },
      { roomNumber: '102', capacity: 50, type: 'lecture', facilities: ['projector'], building: 'Main' },
      { roomNumber: 'Lab1', capacity: 30, type: 'lab', facilities: ['computers'], building: 'Science' }
    ]);
    
    // Add sample courses
    await Course.insertMany([
      { courseCode: 'CS101', courseName: 'Programming Fundamentals', department: 'CS', semester: 1, credits: 4 },
      { courseCode: 'CS102', courseName: 'Data Structures', department: 'CS', semester: 2, credits: 4 }
    ]);
    
    // Add sample faculty
    await Faculty.insertMany([
      { name: 'Dr. John Doe', employeeId: 'FAC001', department: 'CS', courses: ['CS101', 'CS102'] }
    ]);
    
    // Add admin user
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('✅ Sample data added!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedData();