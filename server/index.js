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

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.CLIENT_URL || true, // 'true' reflects the request origin
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

// Trust proxy for Render/Vercel
app.set('trust proxy', 1);

// Routes
app.use('/api/books', require('./routes/book.routes'));
app.use('/api/shelves', require('./routes/shelf.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Health check
app.get('/health', (req, res) => res.send('OK'));

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
