// server/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    toggleReaction // Import the new function
} = require('../controllers/announcementController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   POST /api/announcements
// @desc    Create a new announcement (Admin only)
// @access  Private
router.post('/', auth, adminAuth, createAnnouncement);

// @route   GET /api/announcements
// @desc    Get all announcements (Public)
// @access  Public
router.get('/', getAnnouncements);

// @route   PUT /api/announcements/:id
// @desc    Update an announcement by ID (Admin only)
// @access  Private
router.put('/:id', auth, adminAuth, updateAnnouncement);

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement by ID (Admin only)
// @access  Private
router.delete('/:id', auth, adminAuth, deleteAnnouncement);

// @route   POST /api/announcements/:id/react
// @desc    Add or remove a reaction to an announcement (Authenticated users)
// @access  Private
router.post('/:id/react', auth, toggleReaction); // New route for reactions

module.exports = router;
