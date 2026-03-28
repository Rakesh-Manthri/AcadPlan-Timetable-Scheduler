// authRoutes.js - Defines login/register URLs
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// When someone visits /api/auth/register, run the register function
router.post('/register', register);

// When someone visits /api/auth/login, run the login function
router.post('/login', login);

module.exports = router;