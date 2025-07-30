// // server/controllers/timetableController.js
// const TimetableEntry = require('../models/TimetableEntry');

// // @desc    Get schedule for the authenticated user
// // @route   GET /api/timetable
// // @access  Private (Authenticated users only)
// exports.getSchedule = async (req, res) => {
//     try {
//         // Fetch only timetable entries belonging to the authenticated user
//         // Sort by day (e.g., Monday first) and then by time
//         const schedule = await TimetableEntry.find({ user: req.user.id }).sort({ day: 1, time: 1 });
//         res.json(schedule);
//     } catch (err) {
//         console.error('Error fetching schedule:', err.message);
//         res.status(500).send('Server Error');
//     }
// };

// // @desc    Add a new class entry to the timetable
// // @route   POST /api/timetable
// // @access  Private (Authenticated users only)
// exports.addClass = async (req, res) => {
//     const { day, time, subject, code, location } = req.body;
//     const userId = req.user.id; // Get user ID from the authenticated token

//     try {
//         const newClass = new TimetableEntry({
//             user: userId,
//             day,
//             time,
//             subject,
//             code,
//             location
//         });

//         const savedClass = await newClass.save();
//         res.status(201).json(savedClass);
//     } catch (err) {
//         console.error('Error adding class:', err.message);
//         res.status(500).send('Server Error');
//     }
// };

// // @desc    Update a class entry
// // @route   PUT /api/timetable/:id
// // @access  Private (Authenticated users only, with ownership check)
// exports.updateClass = async (req, res) => {
//     const { day, time, subject, code, location } = req.body;

//     try {
//         let entry = await TimetableEntry.findById(req.params.id);

//         if (!entry) {
//             return res.status(404).json({ msg: 'Class not found' });
//         }
//         // Ensure entry belongs to the authenticated user
//         if (entry.user.toString() !== req.user.id) {
//             return res.status(401).json({ msg: 'Not authorized to update this class' });
//         }

//         // Update fields
//         entry.day = day || entry.day;
//         entry.time = time || entry.time;
//         entry.subject = subject || entry.subject;
//         entry.code = code || entry.code;
//         entry.location = location || entry.location;

//         await entry.save(); // Use save() to trigger pre-save hooks if any, or findByIdAndUpdate
//         res.json(entry);
//     } catch (err) {
//         console.error('Error updating class:', err.message);
//         if (err.kind === 'ObjectId') {
//             return res.status(400).json({ msg: 'Invalid Class ID' });
//         }
//         res.status(500).send('Server Error');
//     }
// };

// // @desc    Delete a class entry
// // @route   DELETE /api/timetable/:id
// // @access  Private (Authenticated users only, with ownership check)
// exports.deleteClass = async (req, res) => {
//     try {
//         let entry = await TimetableEntry.findById(req.params.id);

//         if (!entry) {
//             return res.status(404).json({ msg: 'Class not found' });
//         }
//         // Ensure entry belongs to the authenticated user
//         if (entry.user.toString() !== req.user.id) {
//             return res.status(401).json({ msg: 'Not authorized to delete this class' });
//         }

//         await TimetableEntry.deleteOne({ _id: req.params.id }); // Use deleteOne
//         res.json({ msg: 'Class removed' });
//     } catch (err) {
//         console.error('Error deleting class:', err.message);
//         if (err.kind === 'ObjectId') {
//             return res.status(400).json({ msg: 'Invalid Class ID' });
//         }
//         res.status(500).send('Server Error');
//     }
// };
