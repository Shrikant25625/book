import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api';
import { Star, BookOpen, MessageSquare, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [statsRes, reviewsRes] = await Promise.all([
                userAPI.getStats(),
                userAPI.getReviews()
            ]);
            setStats(statsRes.data);
            setReviews(reviewsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ textAlign: 'center', padding: '4rem' }}>Please sign in to view your profile.</div>;
    if (loading) return null;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header className="glass-effect" style={{ padding: '3rem', display: 'flex', alignItems: 'center', gap: '3rem', marginBottom: '3rem' }}>
                <img src={user.profilePic} style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid var(--accent-primary)' }} />
                <div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{user.displayName}</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Member since {new Date(user.createdAt || Date.now()).getFullYear()}</p>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.booksRead || 0}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Books Read</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.reviewsWritten || 0}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reviews</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(stats?.avgRatingGiven || 0).toFixed(1)}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg Rating</p>
                        </div>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem' }}>
                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Recent Reviews</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {reviews.map(rev => (
                            <div key={rev._id} className="glass-effect" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <img src={rev.book.coverImage} style={{ width: '50px', height: '75px', borderRadius: '4px' }} />
                                        <div>
                                            <Link to={`/book/${rev.book._id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>{rev.book.title}</Link>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rev.book.author}</p>
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

                <aside>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Achievements</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="glass-effect" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Award color="#fbbf24" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Avid Reader</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Read 10+ books</p>
                            </div>
                        </div>
                        <div className="glass-effect" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
                            <Star color="#38bdf8" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Critic</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Write 5+ reviews</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Profile;
