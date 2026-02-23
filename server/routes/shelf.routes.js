const express = require('express');
const router = express.Router();
const shelfController = require('../controllers/shelf.controller');
const { ensureAuth } = require('../middleware/auth.middleware');

router.get('/:shelfId', ensureAuth, shelfController.getShelfById);
router.get('/', ensureAuth, shelfController.getUserShelves);
router.post('/', ensureAuth, shelfController.createShelf);
router.post('/add', ensureAuth, shelfController.addBookToShelf);
router.post('/move', ensureAuth, shelfController.moveBook);

module.exports = router;
