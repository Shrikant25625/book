const Shelf = require('../models/Shelf');

// Helper to ensure default shelves exist for a user
const ensureDefaultShelves = async (userId) => {
    const defaults = ['Want to Read', 'Currently Reading', 'Read'];
    const existing = await Shelf.find({ user: userId, type: 'default' });

    if (existing.length < defaults.length) {
        const existingNames = existing.map(s => s.name);
        for (const name of defaults) {
            if (!existingNames.includes(name)) {
                await Shelf.create({ user: userId, name, type: 'default' });
            }
        }
        return await Shelf.find({ user: userId }).populate('books');
    }
    return null;
};

exports.createShelf = async (req, res) => {
    try {
        const { name } = req.body;
        const shelf = await Shelf.create({ user: req.user._id, name, type: 'custom' });
        res.status(201).json(shelf);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getShelfById = async (req, res) => {
    try {
        const shelf = await Shelf.findOne({ _id: req.params.shelfId, user: req.user._id }).populate('books');
        if (!shelf) return res.status(404).json({ message: 'Shelf not found' });
        res.json(shelf);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserShelves = async (req, res) => {
    try {
        await ensureDefaultShelves(req.user._id);
        const shelves = await Shelf.find({ user: req.user._id }).populate('books');
        res.json(shelves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addBookToShelf = async (req, res) => {
    try {
        const { shelfId, bookId } = req.body;
        const shelf = await Shelf.findOne({ _id: shelfId, user: req.user._id });
        if (!shelf) return res.status(404).json({ message: 'Shelf not found' });

        if (shelf.type === 'default') {
            await Shelf.updateMany(
                { user: req.user._id, type: 'default' },
                { $pull: { books: bookId } }
            );
        }

        if (!shelf.books.includes(bookId)) {
            shelf.books.push(bookId);
            await shelf.save();
        }
        res.json(shelf);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.moveBook = async (req, res) => {
    try {
        const { bookId, targetShelfName } = req.body;

        // Ensure default shelves exist before moving
        await ensureDefaultShelves(req.user._id);

        await Shelf.updateMany(
            { user: req.user._id, type: 'default' },
            { $pull: { books: bookId } }
        );

        const targetShelf = await Shelf.findOneAndUpdate(
            { user: req.user._id, name: targetShelfName, type: 'default' },
            { $addToSet: { books: bookId } },
            { returnDocument: 'after' }
        );

        if (!targetShelf) {
            console.error(`Failed to find target shelf: ${targetShelfName} for user ${req.user._id}`);
        }

        const allShelves = await Shelf.find({ user: req.user._id }).populate('books');
        console.log(`Moving book to ${targetShelfName}. User: ${req.user._id}, Total shelves: ${allShelves?.length}`);
        res.json(allShelves || []);
    } catch (err) {
        console.error('Error in moveBook:', err);
        res.status(500).json({ message: err.message });
    }
};
