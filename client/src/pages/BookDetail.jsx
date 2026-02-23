import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookAPI, shelfAPI, reviewAPI } from '../api';
import { useAuth } from '../hooks/useAuth';
import { Star, Clock, BookOpen, CheckCircle, Plus } from 'lucide-react';

const BookDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [showSuccess, setShowSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, [id, user]);

    const fetchData = async () => {
        try {
            const [bookRes, reviewsRes] = await Promise.all([
                bookAPI.getById(id),
                reviewAPI.getByBook(id)
            ]);
            setBook(bookRes.data);
            setReviews(reviewsRes.data);

            if (user) {
                const shelvesRes = await shelfAPI.getAll();
                setShelves(shelvesRes.data || []);
                const existingReview = reviewsRes.data.find(r => r.user._id === user._id);
                if (existingReview) {
                    setRating(existingReview.rating);
                    setComment(existingReview.comment || '');
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleShelfAction = async (shelfName) => {
        if (!user) return alert('Please sign in to add books to shelves');
        try {
            const res = await shelfAPI.moveBook(id, shelfName);
            setShelves(res.data || []);
            setShowSuccess(`Moved to ${shelfName}`);
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCustomShelfAdd = async (shelfId, shelfName) => {
        try {
            await shelfAPI.addBook(shelfId, id);
            const shelvesRes = await shelfAPI.getAll();
            setShelves(shelvesRes.data || []);
            setShowSuccess(`Added to ${shelfName}`);
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return alert('Please provide a rating');
        try {
            const existing = reviews.find(r => r.user._id === user._id);
            if (existing) {
                await reviewAPI.update(existing._id, { rating, comment });
            } else {
                await reviewAPI.create({ bookId: id, rating, comment });
            }
            fetchData();
            setShowSuccess('Review posted!');
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || !book) return null;

    const userShelf = (shelves || []).find(s =>
        s.type === 'default' &&
        s.books.some(b => {
            const bookId = b._id?.toString() || b;
            return bookId === id;
        })
    )?.name;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', position: 'relative' }}>
            {showSuccess && (
                <div style={{ position: 'fixed', top: '2rem', right: '2rem', background: 'var(--accent-primary)', color: 'white', padding: '1rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 1000, fontWeight: 600, animation: 'slideIn 0.3s ease-out', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{showSuccess}</span>
                    <button
                        onClick={() => setShowSuccess('')}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                    >
                        ×
                    </button>
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
                <div>
                    <img src={book.coverImage} alt={book.title} style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }} />

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            onClick={() => handleShelfAction('Want to Read')}
                            className={userShelf === 'Want to Read' ? 'btn-primary' : 'glass-effect'}
                            style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, border: userShelf === 'Want to Read' ? 'none' : '1px solid var(--glass-border)', color: userShelf === 'Want to Read' ? 'white' : 'inherit', cursor: 'pointer' }}
                        >
                            <Clock size={18} /> Want to Read
                        </button>
                        <button
                            onClick={() => handleShelfAction('Currently Reading')}
                            className={userShelf === 'Currently Reading' ? 'btn-primary' : 'glass-effect'}
                            style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, border: userShelf === 'Currently Reading' ? 'none' : '1px solid var(--glass-border)', color: userShelf === 'Currently Reading' ? 'white' : 'inherit', cursor: 'pointer' }}
                        >
                            <BookOpen size={18} /> Currently Reading
                        </button>
                        <button
                            onClick={() => handleShelfAction('Read')}
                            className={userShelf === 'Read' ? 'btn-primary' : 'glass-effect'}
                            style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, border: userShelf === 'Read' ? 'none' : '1px solid var(--glass-border)', color: userShelf === 'Read' ? 'white' : 'inherit', cursor: 'pointer' }}
                        >
                            <CheckCircle size={18} /> Read
                        </button>

                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 500 }}>Add to collection:</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {shelves.filter(s => s.type === 'custom').length > 0 ? (
                                    shelves.filter(s => s.type === 'custom').map(s => {
                                        const isBookInShelf = s.books.some(b => (b._id?.toString() || b) === id);
                                        return (
                                            <button
                                                key={s._id}
                                                onClick={() => handleCustomShelfAdd(s._id, s.name)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.6rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid var(--glass-border)',
                                                    background: isBookInShelf ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                                                    color: isBookInShelf ? '#38bdf8' : 'white',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <span>{s.name}</span>
                                                {isBookInShelf ? <CheckCircle size={14} /> : <Plus size={14} />}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <Link to="/shelves" style={{ fontSize: '0.85rem', color: '#38bdf8', textDecoration: 'none' }}>Create a custom shelf +</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1.1 }}>{book.title}</h1>
                    <p style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', marginTop: '0.5rem' }}>by {book.author}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', margin: '1.5rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Star size={24} fill="#fbbf24" color="#fbbf24" />
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Number(book.avgRating).toFixed(1)}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>({book.reviewCount} reviews)</span>
                        </div>
                        <div style={{ height: '30px', width: '1px', background: 'var(--glass-border)' }}></div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            {book.genre} • {book.pageCount} pages
                        </div>
                    </div>

                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{book.description}</p>

                    <section style={{ marginTop: '4rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Community Reviews</h2>

                        {user && (
                            <form onSubmit={handleReviewSubmit} className="glass-effect" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>{reviews.some(r => r.user._id === user._id) ? 'Edit Your Review' : 'Write a Review'}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            size={24}
                                            fill={s <= rating ? "#fbbf24" : "transparent"}
                                            color="#fbbf24"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setRating(s)}
                                        />
                                    ))}
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you think of this book?"
                                    style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', marginBottom: '1rem', outline: 'none' }}
                                />
                                <button type="submit" className="btn-primary">{reviews.some(r => r.user._id === user._id) ? 'Update' : 'Post'} Review</button>
                            </form>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {reviews.map(rev => (
                                <div key={rev._id} className="glass-effect" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img src={rev.user.profilePic} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{rev.user.displayName}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(rev.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.1rem' }}>
                                            {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)' }}>{rev.comment}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default BookDetail;
