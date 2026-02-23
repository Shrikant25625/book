const User = require('../models/User');
const Review = require('../models/Review');

exports.getMe = async (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const stats = req.user.stats;
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRecentReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('book', 'title author coverImage')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
