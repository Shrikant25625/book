import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const BookCard = ({ book }) => {
    return (
        <Link to={`/book/${book._id}`} className="glass-effect" style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden', transition: 'transform 0.3s ease' }}>
            <div style={{ position: 'relative', height: '280px' }}>
                <img
                    src={book.coverImage}
                    alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                        <Star size={14} fill="#fbbf24" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{Number(book.avgRating).toFixed(1)}</span>
                    </div>
                </div>
            </div>
            <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{book.author}</p>
            </div>
            <style>{`
        a:hover { transform: translateY(-8px); border-color: var(--accent-primary); }
      `}</style>
        </Link>
    );
};

export default BookCard;
