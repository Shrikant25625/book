const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');

router.get('/trending', bookController.getTrendingBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

module.exports = router;
