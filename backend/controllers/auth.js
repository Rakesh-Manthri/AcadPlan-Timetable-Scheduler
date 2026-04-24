const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (Normally this would be restricted to Admin in production)
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Pattern-Based Student Authentication
        const studentRegex = /^1602-(\d{2})-737-\d{3}$/;
        const match = email.match(studentRegex);

        if (match) {
            if (password !== 'Student#123') {
                return res.status(401).json({ success: false, error: 'Invalid student credentials' });
            }

            const admissionYear = 2000 + parseInt(match[1]);
            // Simplified year calculation based on 2026 as current year context
            const academicYear = 2026 - admissionYear;

            const token = jwt.sign(
                { id: email, role: 'student', year: academicYear }, 
                process.env.JWT_SECRET, 
                { expiresIn: process.env.JWT_EXPIRE }
            );

            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: email,
                    name: `Student`,
                    role: 'student',
                    email: email,
                    year: academicYear
                }
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            role: user.role,
            email: user.email
        }
    });
};
