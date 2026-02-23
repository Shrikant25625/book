const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePic: { type: String },
  stats: {
    booksRead: { type: Number, default: 0 },
    reviewsWritten: { type: Number, default: 0 },
    avgRatingGiven: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
