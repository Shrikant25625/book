const mongoose = require('mongoose');
const Book = require('../models/Book');

exports.getTrendingBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ reviewCount: -1, avgRating: -1 }).limit(10);
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.searchBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        // 1. Search local DB
        const localBooks = await Book.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } }
            ]
        }).limit(20);

        // 2. Search Google Books API
        let googleBooks = [];
        try {
            const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10`);
            const data = await googleRes.json();

            if (data.items) {
                googleBooks = data.items.map(item => ({
                    _id: `google_${item.id}`,
                    title: item.volumeInfo.title,
                    author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
                    description: item.volumeInfo.description,
                    coverImage: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover',
                    genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'General',
                    pageCount: item.volumeInfo.pageCount || 0,
                    avgRating: item.volumeInfo.averageRating || 0,
                    reviewCount: item.volumeInfo.ratingsCount || 0,
                    googleId: item.id,
                    isGoogleBook: true
                }));
            }
        } catch (apiErr) {
            console.error('Google Books API Error:', apiErr);
        }

        // Combine results: Prioritize local matches, then add unique Google matches
        const localIds = new Set(localBooks.map(b => b.googleId).filter(id => id));
        const uniqueGoogleBooks = googleBooks.filter(gb => !localIds.has(gb.googleId));

        res.json([...localBooks, ...uniqueGoogleBooks]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if it's a MongoDB ID
        if (mongoose.Types.ObjectId.isValid(id)) {
            const book = await Book.findById(id);
            if (book) return res.json(book);
        }

        // Check if it's a prefixed Google ID
        if (id.startsWith('google_')) {
            const googleId = id.replace('google_', '');

            // Check if we already synced this book
            let book = await Book.findOne({ googleId });
            if (book) return res.json(book);

            // Fetch from Google Books and sync to DB
            const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleId}`);
            const data = await googleRes.json();

            if (data.error) return res.status(404).json({ message: 'Google Book not found' });

            const item = data;
            const newBook = new Book({
                title: item.volumeInfo.title,
                author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
                description: item.volumeInfo.description,
                coverImage: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover',
                genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'General',
                pageCount: item.volumeInfo.pageCount || 0,
                avgRating: item.volumeInfo.averageRating || 0,
                reviewCount: item.volumeInfo.ratingsCount || 0,
                googleId: item.id
            });

            await newBook.save();
            return res.json(newBook);
        }

        res.status(404).json({ message: 'Book not found' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
