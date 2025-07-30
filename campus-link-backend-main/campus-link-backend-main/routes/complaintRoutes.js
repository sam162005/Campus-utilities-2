const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth, adminAuth } = require('../middleware/auth'); // Ensure adminAuth is imported if used

router.get('/', auth, complaintController.getComplaints); // Assuming getComplaints is protected
router.post('/', auth, complaintController.createComplaint);
// Corrected: Using updateComplaintStatus as per the provided controller
router.put('/:id', [auth, adminAuth], complaintController.updateComplaintStatus);

// Optional: If you have delete functionality
// router.delete('/:id', [auth, adminAuth], complaintController.deleteComplaint);

module.exports = router;
