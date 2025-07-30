// // server/models/TimetableEntry.js
// const mongoose = require('mongoose');

// const TimetableEntrySchema = new mongoose.Schema({
//     user: { // Link to the user who owns this timetable entry
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     day: { // Day of the week (e.g., "Monday", "Tuesday")
//         type: String,
//         required: true,
//         enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] // Ensure valid days
//     },
//     time: { // Time slot (e.g., "09:00 - 10:30")
//         type: String,
//         required: true,
//         trim: true
//     },
//     subject: { // Name of the subject/course
//         type: String,
//         required: true,
//         trim: true
//     },
//     code: { // Optional subject code (e.g., "MA101")
//         type: String,
//         trim: true
//     },
//     location: { // Optional class location (e.g., "Block A, Room 201")
//         type: String,
//         trim: true
//     },
// }, { timestamps: true }); // Adds createdAt and updatedAt

// // This line handles hot-reloading in some environments, ensuring the model isn't redefined
// module.exports = mongoose.models.TimetableEntry || mongoose.model('TimetableEntry', TimetableEntrySchema);
