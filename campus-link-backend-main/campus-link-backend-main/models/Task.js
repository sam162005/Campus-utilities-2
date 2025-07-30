// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: { // Optional detailed description
        type: String,
        trim: true
    },
    deadline: { // The date the task is due
        type: Date,
        required: true
    },
    time: { // Specific time for the task (e.g., "09:00")
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    user: { // Link to the user who owns this task
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completed: { // To mark task as completed
        type: Boolean,
        default: false
    },
    notificationSent: { // NEW FIELD: To track if a reminder notification has been sent
        type: Boolean,
        default: false
    }

}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Task', TaskSchema);
