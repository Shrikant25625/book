const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const Book = require('./models/Book');
const User = require('./models/User');
const Review = require('./models/Review');
const Shelf = require('./models/Shelf');

dotenv.config();

const SEED_CONFIG = {
    books: 1200,
    users: 40,
    reviews: 450,
};

const genres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Thriller', 'Mystery'];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Book.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        await Shelf.deleteMany({});
        console.log('Cleared existing data');

        // Seed Books
        const books = [];
        for (let i = 0; i < SEED_CONFIG.books; i++) {
            books.push({
                title: faker.book.title(),
                author: faker.book.author(),
                description: faker.lorem.paragraphs(2),
                coverImage: `https://picsum.photos/seed/${faker.string.uuid()}/300/450`,
                genre: faker.helpers.arrayElement(genres),
                pageCount: faker.number.int({ min: 100, max: 800 }),
                avgRating: 0,
                reviewCount: 0,
                trendingScore: faker.number.int({ min: 0, max: 100 })
            });
        }
        const createdBooks = await Book.insertMany(books);
        console.log(`Seeded ${createdBooks.length} books`);

        // Seed Users
        const users = [];
        for (let i = 0; i < SEED_CONFIG.users; i++) {
            users.push({
                googleId: faker.string.uuid(),
                displayName: faker.person.fullName(),
                email: faker.internet.email(),
                profilePic: faker.image.avatar(),
                stats: {
                    booksRead: 0,
                    reviewsWritten: 0,
                    avgRatingGiven: 0
                }
            });
        }
        const createdUsers = await User.insertMany(users);
        console.log(`Seeded ${createdUsers.length} users`);

        // Create Default Shelves for each user
        for (const user of createdUsers) {
            await Shelf.insertMany([
                { user: user._id, name: 'Want to Read', type: 'default', books: [] },
                { user: user._id, name: 'Currently Reading', type: 'default', books: [] },
                { user: user._id, name: 'Read', type: 'default', books: [] }
            ]);
        }
        console.log('Created default shelves for all users');

        // Seed Reviews & Update Book Stats
        for (let i = 0; i < SEED_CONFIG.reviews; i++) {
            const user = faker.helpers.arrayElement(createdUsers);
            const book = faker.helpers.arrayElement(createdBooks);
            const rating = faker.number.int({ min: 1, max: 5 });

            try {
                await Review.create({
                    user: user._id,
                    book: book._id,
                    rating,
                    comment: faker.lorem.sentences(2)
                });

                // Update book stats (simplified for seeding)
                book.reviewCount += 1;
                book.avgRating = ((book.avgRating * (book.reviewCount - 1)) + rating) / book.reviewCount;
                await book.save();

                // Update user stats
                user.stats.reviewsWritten += 1;
                await user.save();
            } catch (err) {
                // Skip duplicate user-book reviews
                continue;
            }
        }
        console.log('Seeded reviews and updated stats');

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
