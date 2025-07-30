// server/controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User'); // Import User model to get email
const nodemailer = require('nodemailer'); // Assuming nodemailer is already installed and configured
require('dotenv').config();

// Email transporter setup (reusing from authController, ensure it's configured in .env)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password or app-specific password
    }
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Authenticated users only)
exports.createTask = async (req, res) => {
    const { title, description, deadline, time, priority } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated token

    try {
        const newTask = new Task({
            title,
            description,
            deadline,
            time,
            priority,
            user: userId, // Assign the task to the logged-in user
            notificationSent: false // New tasks default to notification not sent
        });

        const task = await newTask.save();
        res.status(201).json(task);
    } catch (err) {
        console.error('Error creating task:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all tasks for the authenticated user
// @route   GET /api/tasks
// @access  Private (Authenticated users only)
exports.getTasks = async (req, res) => {
    try {
        // Fetch only tasks belonging to the authenticated user
        const tasks = await Task.find({ user: req.user.id }).sort({ deadline: 1, time: 1 }); // Sort by deadline then time
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private (Authenticated users only, with ownership check)
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        // Ensure task belongs to the authenticated user
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to view this task' });
        }

        res.json(task);
    } catch (err) {
        console.error('Error fetching task by ID:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Task ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Authenticated users only, with ownership check)
exports.updateTask = async (req, res) => {
    const { title, description, deadline, time, priority, completed } = req.body;

    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        // Ensure task belongs to the authenticated user
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to update this task' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.deadline = deadline || task.deadline;
        task.time = time || task.time;
        task.priority = priority || task.priority;
        task.completed = typeof completed === 'boolean' ? completed : task.completed;
        // Do not reset notificationSent here unless explicitly desired for re-sending (e.g., if deadline is changed significantly)

        await task.save();
        res.json(task);
    } catch (err) {
        console.error('Error updating task:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Task ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Authenticated users only, with ownership check)
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        // Ensure task belongs to the authenticated user
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this task' });
        }

        await Task.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error('Error deleting task:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Task ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Scheduled function to send task reminders
// @access  Internal (called by cron job)
exports.sendTaskReminders = async () => {
    console.log('Running scheduled task reminder check...');
    const now = new Date();
    // Calculate the window for tasks due in approximately 24 hours
    // This range handles slight variations in cron job execution time
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Exactly 24 hours from now
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000); // Upper bound to catch tasks due soon

    try {
        // Find tasks that are:
        // 1. Not yet completed
        // 2. Notification not yet sent
        // 3. Deadline is within the next 24 to 48 hours (or a similar window)
        const tasksDueSoon = await Task.find({
            completed: false,
            notificationSent: false,
            deadline: {
                $gte: twentyFourHoursFromNow, // Deadline is 24 hours from now or later
                $lt: fortyEightHoursFromNow   // Deadline is before 48 hours from now
            }
        }).populate('user', 'name email'); // Populate user data to get their email and name

        if (tasksDueSoon.length === 0) {
            console.log('No tasks due in the next 24-48 hours requiring a reminder.');
            return;
        }

        console.log(`Found ${tasksDueSoon.length} tasks due soon. Sending reminders...`);

        for (const task of tasksDueSoon) {
            // Basic check to ensure user and email exist
            if (!task.user || !task.user.email) {
                console.warn(`Skipping reminder for task "${task.title}" (ID: ${task._id}): User or user email not found.`);
                continue;
            }

            const mailOptions = {
                from: process.env.EMAIL_USER, // Sender email from .env
                to: task.user.email,         // Recipient email
                subject: `CampusLink Task Reminder: ${task.title}`, // Email subject
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #007bff;">Task Reminder from CampusLink</h2>
                        <p>Hello ${task.user.name},</p>
                        <p>This is a friendly reminder for your upcoming task:</p>
                        <div style="background-color: #f0f8ff; padding: 15px; border-left: 5px solid #007bff; margin-bottom: 20px;">
                            <h3 style="margin-top: 0; color: #007bff;">${task.title}</h3>
                            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
                            <p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()} at ${task.time || 'N/A'}</p>
                            <p><strong>Priority:</strong> ${task.priority}</p>
                        </div>
                        <p>Please ensure you complete it on time.</p>
                        <p>Best regards,<br/>The CampusLink Team</p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                // Mark the notification as sent for this task
                await Task.findByIdAndUpdate(task._id, { notificationSent: true });
                console.log(`Reminder sent for task: "${task.title}" to ${task.user.email}`);
            } catch (mailError) {
                console.error(`Failed to send reminder email for task "${task.title}" to ${task.user.email}:`, mailError);
            }
        }
        console.log('Task reminder check completed.');
    } catch (err) {
        console.error('Error in sendTaskReminders scheduled job:', err.message);
    }
};
