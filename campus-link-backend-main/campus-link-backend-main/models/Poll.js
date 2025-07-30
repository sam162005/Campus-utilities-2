// server/models/Poll.js
const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: [
        {
            text: { // The text of the option (e.g., "Yes", "No", "Option A")
                type: String,
                required: true,
                trim: true
            },
            votes: { // Count of votes for this option
                type: Number,
                default: 0
            },
            voters: [ // Array of user IDs who voted for this option
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User' // Reference to the User model
                }
            ]
        }
    ],
    isActive: { // To activate/deactivate polls
        type: Boolean,
        default: true
    },
    isAnonymous: { // NEW FIELD: True if poll is anonymous, false otherwise
        type: Boolean,
        default: false // Default to non-anonymous (normal)
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Optional: To track which admin created the poll
    // createdBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }
}, { timestamps: true });

module.exports = mongoose.model('Poll', PollSchema);
