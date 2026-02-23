const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { ensureAuth } = require('../middleware/auth.middleware');

router.post('/', ensureAuth, reviewController.createReview);
router.put('/:reviewId', ensureAuth, reviewController.updateReview);
router.get('/book/:bookId', reviewController.getBookReviews);

module.exports = router;
