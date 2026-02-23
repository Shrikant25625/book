const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { ensureAuth } = require('../middleware/auth.middleware');

router.get('/me', ensureAuth, userController.getMe);
router.get('/stats', ensureAuth, userController.getUserStats);
router.get('/reviews', ensureAuth, userController.getRecentReviews);

module.exports = router;
