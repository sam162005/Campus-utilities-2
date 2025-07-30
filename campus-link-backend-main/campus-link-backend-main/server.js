// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron'); // Import node-cron

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --- CORS Configuration ---
// IMPORTANT: Replace 'https://your-frontend-name.vercel.app' with your actual Vercel frontend URL
const allowedOrigins = [
    'http://localhost:5173', // For local development (Vite default)
    'http://localhost:5000', // If your local frontend runs on a different port (e.g., 5000)
    // Replace the placeholder below with the actual URL of your Vercel frontend deployment
    'https://campus-link-frontend.vercel.app/' // Your Vercel frontend URL (e.g., https://campus-link-frontend.vercel.app)
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies and auth headers
    optionsSuccessStatus: 204
}));


app.use(express.json()); // To parse JSON bodies

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));


// --- API Routes ---
app.get('/', (req, res) => {
    res.send('CampusLink API is running...');
});

// Import and use routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/lost-and-found', require('./routes/lostAndFoundRoutes'));
// app.use('/api/timetable', require('./routes/timetableRoutes')); // Uncommented this line to activate fixed timetables
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));


// --- Scheduled Jobs ---
// Import the task controller to access the reminder function
const { sendTaskReminders } = require('./controllers/taskController');

// Schedule task reminders to run daily at, for example, 3:00 AM
// Cron syntax: minute hour day-of-month month day-of-week
// '0 3 * * *' means "at 03:00 AM every day"
// You can adjust the schedule as needed. For testing, you might use a more frequent schedule like '*/1 * * * *' (every minute)
cron.schedule('0 3 * * *', () => {
    console.log('Running daily task reminder job...');
    sendTaskReminders();
}, {
    timezone: "Asia/Kolkata" // Set your desired timezone (e.g., "Asia/Kolkata", "America/New_York")
});

// You can also run it once on server start for immediate check (for development/testing)
// Uncomment the line below if you want to test the reminder function immediately on server start
// sendTaskReminders();


// --- Server Listening ---
const PORT = process.env.PORT || 5000; // Changed default port to 5000 as per your provided code
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
