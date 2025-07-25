// server/controllers/announcementController.js
const Announcement = require('../models/Announcement');

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Admin only - role check handled by adminAuth middleware)
exports.createAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    try {
        const newAnnouncement = new Announcement({
            title,
            content,
            reactions: [] // Initialize reactions as an empty array
        });
        const announcement = await newAnnouncement.save();
        res.status(201).json(announcement);
    } catch (err) {
        console.error('Error creating announcement:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public (All users can view)
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        res.json(announcements);
    } catch (err) {
        console.error('Error fetching announcements:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only - role check handled by adminAuth middleware)
exports.updateAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    try {
        let announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ msg: 'Announcement not found' });
        }
        announcement.title = title || announcement.title;
        announcement.content = content || announcement.content;
        await announcement.save();
        res.json(announcement);
    } catch (err) {
        console.error('Error updating announcement:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Announcement ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only - role check handled by adminAuth middleware)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ msg: 'Announcement not found' });
        }
        await Announcement.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Announcement removed' });
    } catch (err) {
        console.error('Error deleting announcement:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Announcement ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Add or remove a reaction to an announcement
// @route   POST /api/announcements/:id/react
// @access  Private (Authenticated users only)
exports.toggleReaction = async (req, res) => {
    const { id } = req.params; // Announcement ID
    const { emoji } = req.body; // The emoji character (e.g., '👍')
    const userId = req.user.id; // User ID from authenticated token

    try {
        let announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ msg: 'Announcement not found' });
        }

        let reactionIndex = announcement.reactions.findIndex(r => r.emoji === emoji);

        if (reactionIndex === -1) {
            // Emoji not yet present, add new reaction
            announcement.reactions.push({
                emoji,
                count: 1,
                users: [userId]
            });
        } else {
            // Emoji exists, check if user has already reacted
            const userHasReacted = announcement.reactions[reactionIndex].users.includes(userId);

            if (userHasReacted) {
                // User has reacted, so remove their reaction
                announcement.reactions[reactionIndex].count--;
                announcement.reactions[reactionIndex].users = announcement.reactions[reactionIndex].users.filter(
                    (user) => user.toString() !== userId
                );

                // If count becomes 0, remove the emoji entry entirely
                if (announcement.reactions[reactionIndex].count === 0) {
                    announcement.reactions.splice(reactionIndex, 1);
                }
            } else {
                // User has not reacted, so add their reaction
                announcement.reactions[reactionIndex].count++;
                announcement.reactions[reactionIndex].users.push(userId);
            }
        }

        await announcement.save();
        res.json(announcement.reactions); // Return updated reactions
    } catch (err) {
        console.error('Error toggling reaction:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Announcement ID' });
        }
        res.status(500).send('Server Error');
    }
};