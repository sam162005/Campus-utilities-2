// server/routes/pollRoutes.js
const express = require('express');
const router = express.Router();
const {
    createPoll,
    getPolls,
    getPollById,
    votePoll,
    togglePollActiveStatus,
    deletePoll
} = require('../controllers/pollController');
const { auth, adminAuth } = require('../middleware/auth'); // Import auth and adminAuth middleware

// @route   POST /api/polls
// @desc    Create a new poll (Admin only)
// @access  Private
router.post('/', auth, adminAuth, createPoll);

// @route   GET /api/polls
// @desc    Get all active polls (Public - can be viewed by anyone)
// @access  Public
router.get('/', getPolls);

// @route   GET /api/polls/:id
// @desc    Get a single poll by ID (Public)
// @access  Public
router.get('/:id', getPollById);

// @route   POST /api/polls/:id/vote
// @desc    Vote on a poll option (Authenticated users only)
// @access  Private
router.post('/:id/vote', auth, votePoll);

// @route   PUT /api/polls/:id/toggle-active
// @desc    Toggle poll activity status (Admin only)
// @access  Private
router.put('/:id/toggle-active', auth, adminAuth, togglePollActiveStatus);

// @route   DELETE /api/polls/:id
// @desc    Delete a poll (Admin only)
// @access  Private
router.delete('/:id', auth, adminAuth, deletePoll);

module.exports = router;
