const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    genre: { type: String },
    pageCount: { type: Number },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    googleId: { type: String, unique: true, sparse: true },
    isbn: { type: String }
}, { timestamps: true });

BookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', BookSchema);
