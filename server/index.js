const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();
require('./config/passport');

const app = express();

// Trust proxy for Render/Vercel (MUST be before session middleware)
app.set('trust proxy', 1);

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.CLIENT_URL, // Explicit origin for credentials
    credentials: true
}));
app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.CLIENT_URL;

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    name: 'biblio.sid', // Custom cookie name
    cookie: {
        secure: isProduction, // true on Render
        sameSite: isProduction ? 'none' : 'lax', // none for cross-site (Vercel -> Render)
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/books', require('./routes/book.routes'));
app.use('/api/shelves', require('./routes/shelf.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Health check
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({
        status: 'OK',
        database: dbStatus,
        nodeVersion: process.version
    });
});

// Start server first so Render/Health checks pass
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Then connect to DB
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => {
            console.error('MongoDB Connection Error:', err);
            // Don't exit, let the server stay alive so we can see logs
        });
});
