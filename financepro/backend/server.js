const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('================================================================');
    console.error('CRITICAL ERROR: MONGODB_URI environment variable is missing.');
    console.error('The application requires a valid MongoDB connection string.');
    console.error('Please configure MONGODB_URI in your environment variables.');
    console.error('================================================================');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB database'))
    .catch(err => {
        console.error('================================================================');
        console.error('FATAL DATABASE CONNECTION ERROR:', err.message);
        console.error('Please verify your MONGODB_URI connection string and network access.');
        console.error('================================================================');
        process.exit(1);
    });

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const incomeRoutes = require('./routes/income');
const expenseRoutes = require('./routes/expense');
const budgetRoutes = require('./routes/budget');
const chatbotRoutes = require('./routes/chatbot');
const reportsRoutes = require('./routes/reports');
const goalRoutes = require('./routes/goal');
const notificationRoutes = require('./routes/notification');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', incomeRoutes);
app.use('/api', expenseRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api', budgetRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', goalRoutes);
app.use('/api', notificationRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Personal Finance Manager API is running successfully.' });
});

// Additional test route for connection testing
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API connection successful!', 
        timestamp: new Date().toISOString(),
        database: 'Connected to MongoDB'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
