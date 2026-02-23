const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');

const updateBookStats = async (bookId) => {
    const reviews = await Review.find({ book: bookId });
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length : 0;

    await Book.findByIdAndUpdate(bookId, {
        avgRating: Number(avgRating.toFixed(1)),
        reviewCount: reviews.length
    });
};

const updateUserStats = async (userId) => {
    const reviews = await Review.find({ user: userId });
    const avgRatingGiven = reviews.length > 0 ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length : 0;

    await User.findByIdAndUpdate(userId, {
        "stats.reviewsWritten": reviews.length,
        "stats.avgRatingGiven": Number(avgRatingGiven.toFixed(1))
    });
};

exports.createReview = async (req, res) => {
    try {
        const { bookId, rating, comment } = req.body;
        const userId = req.user._id;

        const existingReview = await Review.findOne({ user: userId, book: bookId });
        if (existingReview) return res.status(400).json({ message: 'Review already exists' });

        const review = await Review.create({ user: userId, book: bookId, rating, comment });

        await updateBookStats(bookId);
        await updateUserStats(userId);

        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findOneAndUpdate(
            { _id: req.params.reviewId, user: req.user._id },
            { rating, comment },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: 'Review not found' });

        await updateBookStats(review.book);
        await updateUserStats(req.user._id);

        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ book: req.params.bookId })
            .populate('user', 'displayName profilePic')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
