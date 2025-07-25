// server/models/Announcement.js
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    reactions: [ // New field for reactions
        {
            emoji: { // The emoji character (e.g., '👍', '❤️')
                type: String,
                required: true
            },
            count: { // How many times this emoji has been reacted
                type: Number,
                default: 0
            },
            users: [ // Array of user IDs who reacted with this emoji
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
