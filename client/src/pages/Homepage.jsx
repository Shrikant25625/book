import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookAPI } from '../api';
import BookCard from '../components/BookCard';
import { Loader2, TrendingUp, Search } from 'lucide-react';

const Homepage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    useEffect(() => {
        fetchBooks();
    }, [query]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            if (query) {
                const res = await bookAPI.search(query);
                setBooks(res.data);
            } else {
                const res = await bookAPI.getTrending();
                setBooks(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '0 2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {query ? <Search size={28} color="#38bdf8" /> : <TrendingUp size={28} color="#38bdf8" />}
                    <h1 style={{ fontSize: '2rem' }}>{query ? `Results for "${query}"` : 'Trending Books'}</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {query ? `Found ${books.length} books matching your search.` : 'Discover what the community is reading right now.'}
                </p>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 size={48} className="animate-spin" color="#38bdf8" />
                </div>
            ) : (
                <div className="grid-books">
                    {books.map(book => (
                        <BookCard key={book._id} book={book} />
                    ))}
                </div>
            )}

            {!loading && books.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <p>No books found. Try a different search term!</p>
                </div>
            )}
        </div>
    );
};

export default Homepage;
