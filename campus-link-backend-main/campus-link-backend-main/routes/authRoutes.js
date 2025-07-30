// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtpAndRegister, login } = require('../controllers/authController'); // Import new functions
// const auth = require('../middleware/auth'); // Import auth middleware if you have protected routes

// Public routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp-and-register', verifyOtpAndRegister);
router.post('/login', login);

// Example of a protected route (requires token)
// router.get('/me', auth, getUserProfile);

module.exports = router;