const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@acadplan.edu',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'HOD IT',
    email: 'hod@acadplan.edu',
    password: 'hod123',
    role: 'hod'
  },
  {
    name: 'Faculty User',
    email: 'faculty@acadplan.edu',
    password: 'faculty123',
    role: 'faculty'
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await User.create(users);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
