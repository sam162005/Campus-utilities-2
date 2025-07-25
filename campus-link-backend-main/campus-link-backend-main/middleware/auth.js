// server/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure dotenv is loaded if you use process.env.JWT_SECRET

// Middleware to verify token
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Ensure decoded.user contains { id: user.id, role: user.role }
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Middleware to check for admin role
const adminAuth = (req, res, next) => {
    // This middleware assumes 'auth' middleware has already run and attached req.user
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed
    } else {
        res.status(403).json({ msg: 'Admin resources, access denied' }); // Not an admin
    }
};

module.exports = { auth, adminAuth };
