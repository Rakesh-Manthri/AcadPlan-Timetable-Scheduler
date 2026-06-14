const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const faculty = require('./routes/faculty');
const rooms = require('./routes/rooms');
const timetable = require('./routes/timetable');
const courses = require('./routes/courses');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
// Mount routers
app.use('/api/auth', auth);
app.use('/api/faculty', faculty);
app.use('/api/rooms', rooms);
app.use('/api/timetable', timetable);
app.use('/api/courses', courses);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'AcadPlan API is running...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
