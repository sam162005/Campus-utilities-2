// server/controllers/authController.js
const User = require('../models/User');
const Otp = require('../models/Otp'); // Import the Otp model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// Email transporter setup
// Configure this with your email service details.
// For Gmail, consider using an App Password if 2-Factor Authentication is enabled.
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use 'smtp' for other services
    auth: {
        user: process.env.EMAIL_USER, // Your email address from .env
        pass: process.env.EMAIL_PASS // Your email password or app-specific password from .env
    }
});

// @desc    Send OTP to user's college email for registration
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    // Validate college email format (e.g., sam.j2023it@sece.ac.in)
    // Adjust the regex to match your specific college domain
    const collegeEmailRegex = /^[a-zA-Z0-9.]+@sece\.ac\.in$/; // Updated regex to be more flexible with name part
    if (!collegeEmailRegex.test(email)) {
        return res.status(400).json({ msg: 'Please use your official college email ID (e.g., sam.j2023it@sece.ac.in).' });
    }

    try {
        // Check if a user with this email already exists AND is verified
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ msg: 'User with this email already registered and verified. Please login.' });
        }

        // Generate a 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in the database or update if one already exists for this email.
        // The 'createdAt' field in the Otp model handles expiration automatically.
        await Otp.findOneAndUpdate(
            { email },
            { otp, createdAt: Date.now() }, // Update OTP and reset creation time for expiration
            { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not found, return new doc
        );

        // Email content for the OTP
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'CampusLink - Your Registration OTP',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007bff;">CampusLink Registration OTP</h2>
                    <p>Hello,</p>
                    <p>Thank you for registering with CampusLink. Please use the following One-Time Password (OTP) to complete your registration:</p>
                    <h3 style="color: #28a745; font-size: 28px; text-align: center; background-color: #f0f0f0; padding: 15px; border-radius: 8px; letter-spacing: 2px;">${otp}</h3>
                    <p>This OTP is valid for <strong>5 minutes</strong>. For security reasons, do not share this OTP with anyone.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <p>Best regards,<br/>The CampusLink Team</p>
                </div>
            `
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending OTP email:', error);
                // Return a generic error to the user for security/privacy
                return res.status(500).json({ msg: 'Failed to send OTP email. Please check your email address and try again.' });
            }
            console.log('OTP Email sent successfully:', info.response);
            res.status(200).json({ msg: 'OTP sent to your college email address. Please check your inbox and spam folder.' });
        });

    } catch (err) {
        console.error('Server error during sendOtp:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Verify OTP and complete user registration
// @route   POST /api/auth/verify-otp-and-register
// @access  Public
exports.verifyOtpAndRegister = async (req, res) => {
    const { email, otp, name, password, role } = req.body;

    try {
        // 1. Find the stored OTP for the given email
        const storedOtp = await Otp.findOne({ email });

        // Check if OTP exists and is not expired (handled by Mongoose's 'expires' index)
        if (!storedOtp) {
            return res.status(400).json({ msg: 'OTP expired or invalid. Please request a new OTP.' });
        }

        // 2. Compare the provided OTP with the stored OTP
        if (storedOtp.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP. Please try again.' });
        }

        // 3. Check if a user with this email already exists (e.g., if they started registration but didn't complete)
        let user = await User.findOne({ email });

        if (user) {
            // If user exists but is not verified, update their details and mark as verified
            if (!user.isVerified) {
                user.name = name;
                user.password = password; // Pre-save hook in User model will hash this
                user.role = role || 'student'; // Default to 'student' if not provided
                user.isVerified = true; // Mark email as verified
                await user.save();
            } else {
                // This case should ideally be caught by sendOtp, but as a fallback
                return res.status(400).json({ msg: 'User with this email already registered and verified. Please login.' });
            }
        } else {
            // 4. If no user exists, create a new user
            user = new User({
                name,
                email,
                password, // Pre-save hook in User model will hash this
                role: role || 'student', // Default role for new registrations
                isVerified: true // Mark email as verified upon successful OTP verification
            });
            await user.save();
        }

        // 5. Remove the OTP from the database after successful verification and registration
        await Otp.deleteOne({ email });

        // 6. Generate JWT token for the newly registered and verified user
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token valid for 1 hour
            (err, token) => {
                if (err) throw err;
                // Return token and basic user info
                res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );

    } catch (err) {
        console.error('Server error during OTP verification and registration:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    User login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body; // Include role in login request

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Crucial: Check if the user's email is verified before allowing login
        if (!user.isVerified) {
            return res.status(400).json({ msg: 'Your email address is not verified. Please complete the registration process or re-register.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check if the role provided in login matches the user's registered role
        if (user.role !== role) {
            return res.status(403).json({ msg: `Access denied. You are registered as a ${user.role}.` });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error('Server error during login:', err.message);
        res.status(500).send('Server error');
    }
};

// The original `exports.register` function is removed as it's replaced by
// the `sendOtp` and `verifyOtpAndRegister` flow.
