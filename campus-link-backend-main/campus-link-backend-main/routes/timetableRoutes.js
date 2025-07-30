// // server/routes/timetableRoutes.js
// const express = require('express');
// const router = express.Router();
// const timetableController = require('../controllers/timetableController');
// const { auth } = require('../middleware/auth'); // Only auth middleware is needed for personal timetables

// // @route   GET /api/timetable
// // @desc    Get schedule for the authenticated user
// // @access  Private
// router.get('/', auth, timetableController.getSchedule);

// // @route   POST /api/timetable
// // @desc    Add a new class entry
// // @access  Private
// router.post('/', auth, timetableController.addClass);

// // @route   PUT /api/timetable/:id
// // @desc    Update a class entry by ID
// // @access  Private
// router.put('/:id', auth, timetableController.updateClass);

// // @route   DELETE /api/timetable/:id
// // @desc    Delete a class entry by ID
// // @access  Private
// router.delete('/:id', auth, timetableController.deleteClass);

// module.exports = router;
