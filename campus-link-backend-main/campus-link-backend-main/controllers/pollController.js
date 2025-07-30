// server/controllers/pollController.js
const Poll = require('../models/Poll');

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Private (Admin only)
exports.createPoll = async (req, res) => {
    const { question, options, isAnonymous } = req.body; // Added isAnonymous

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ msg: 'Please provide a question and at least two options.' });
    }

    const pollOptions = options.map(optText => ({ text: optText, votes: 0, voters: [] }));

    try {
        const newPoll = new Poll({
            question,
            options: pollOptions,
            isActive: true,
            isAnonymous: !!isAnonymous, // Ensure it's a boolean, default to false if not provided
            // createdBy: req.user.id
        });

        const poll = await newPoll.save();
        res.status(201).json(poll);
    } catch (err) {
        console.error('Error creating poll:', err.message);
        res.status(500).send('Server Error');
    }
};

// Helper function to populate voters for non-anonymous polls
const populateVotersForPolls = (query) => {
    // If poll is not anonymous, populate voter names
    return query.populate({
        path: 'options.voters',
        select: 'name' // Only fetch the 'name' field from the User model
    });
};


// @desc    Get all active polls
// @route   GET /api/polls
// @access  Public (All users can view)
exports.getPolls = async (req, res) => {
    try {
        let query = Poll.find({ isActive: true }).sort({ createdAt: -1 });

        // Apply population only if the poll is NOT anonymous
        // We fetch all polls and let the frontend decide how to display based on isAnonymous flag
        // However, to optimize, we only populate if it's potentially needed.
        // For simplicity, we'll populate all for now, and frontend will filter.
        // A more advanced approach would be to only populate if the poll is not anonymous.
        // For this implementation, we will populate the voters in all cases for simplicity,
        // and the frontend will conditionally display based on `isAnonymous`.
        query = populateVotersForPolls(query);


        const polls = await query.exec();
        res.json(polls);
    } catch (err) {
        console.error('Error fetching polls:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a single poll by ID
// @route   GET /api/polls/:id
// @access  Public (All users can view)
exports.getPollById = async (req, res) => {
    try {
        let poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }

        // Populate voters if the poll is not anonymous
        // For simplicity, we'll populate the voters in all cases for now,
        // and the frontend will conditionally display based on `isAnonymous`.
        poll = await populateVotersForPolls(Poll.findById(req.params.id)).exec();


        res.json(poll);
    } catch (err) {
        console.error('Error fetching poll by ID:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Poll ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Vote on a poll option
// @route   POST /api/polls/:id/vote
// @access  Private (Authenticated users only)
exports.votePoll = async (req, res) => {
    const { id } = req.params; // Poll ID
    const { optionId } = req.body; // The _id of the option being voted for
    const userId = req.user.id; // User ID from authenticated token

    try {
        let poll = await Poll.findById(id);

        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }
        if (!poll.isActive) {
            return res.status(400).json({ msg: 'This poll is no longer active.' });
        }

        // Check if user has already voted in this poll
        const hasVoted = poll.options.some(option =>
            option.voters.includes(userId)
        );

        if (hasVoted) {
            return res.status(400).json({ msg: 'You have already voted in this poll.' });
        }

        // Find the option and add the vote
        const optionIndex = poll.options.findIndex(opt => opt._id.toString() === optionId);

        if (optionIndex === -1) {
            return res.status(400).json({ msg: 'Invalid option selected.' });
        }

        poll.options[optionIndex].votes++;
        poll.options[optionIndex].voters.push(userId);

        await poll.save();

        // After saving, re-fetch the poll with populated voters to send back to frontend
        const updatedPoll = await populateVotersForPolls(Poll.findById(id)).exec();

        res.json(updatedPoll); // Return the updated poll to the frontend to refresh results
    } catch (err) {
        console.error('Error voting on poll:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Poll ID or Option ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Toggle poll activity status (Admin only)
// @route   PUT /api/polls/:id/toggle-active
// @access  Private (Admin only)
exports.togglePollActiveStatus = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }

        poll.isActive = !poll.isActive; // Toggle the status
        await poll.save();

        res.json({ msg: `Poll status updated to ${poll.isActive ? 'active' : 'inactive'}`, poll });
    } catch (err) {
        console.error('Error toggling poll status:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Poll ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a poll (Admin only)
// @route   DELETE /api/polls/:id
// @access  Private (Admin only)
exports.deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }

        await Poll.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Poll removed' });
    } catch (err) {
        console.error('Error deleting poll:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Poll ID' });
        }
        res.status(500).send('Server Error');
    }
};
