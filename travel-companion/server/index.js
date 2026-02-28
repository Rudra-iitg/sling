const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const userRoutes = require('./routes/users');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);

// Serve main page for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🚗 TravelCompanion Server Running!                     ║
    ║                                                           ║
    ║   Local:    http://localhost:${PORT}                        ║
    ║   Mode:     ${process.env.NODE_ENV || 'development'}
    ║                                                           ║
    ║   Press Ctrl+C to stop the server                        ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
});