const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const redirectUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(redirectUrl);
    }
);

router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        const redirectUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(redirectUrl);
    });
});

module.exports = router;
