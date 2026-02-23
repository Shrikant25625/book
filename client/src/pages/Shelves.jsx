import React, { useEffect, useState } from 'react';
import { shelfAPI } from '../api';
import { Book, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Shelves = () => {
    const [shelves, setShelves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newShelfName, setNewShelfName] = useState('');
    const [activeShelf, setActiveShelf] = useState(null);

    const { user } = useAuth();

    useEffect(() => {
        if (user) fetchShelves();
    }, [user]);

    const fetchShelves = async () => {
        try {
            const res = await shelfAPI.getAll();
            setShelves(res.data || []);
            const data = res.data || [];
            if (data.length > 0 && !activeShelf) {
                setActiveShelf(data[0]);
            } else if (activeShelf) {
                const refreshed = data.find(s => s._id.toString() === activeShelf._id.toString());
                if (refreshed) setActiveShelf(refreshed);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShelf = async (e) => {
        e.preventDefault();
        if (!newShelfName.trim()) return;
        try {
            await shelfAPI.create(newShelfName);
            setNewShelfName('');
            fetchShelves();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
    if (!user) return <div style={{ textAlign: 'center', padding: '4rem' }}>Please sign in to view your shelves.</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
            <aside>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>My Shelves</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {shelves.map(shelf => (
                        <button
                            key={shelf._id}
                            onClick={() => setActiveShelf(shelf)}
                            className={activeShelf?._id === shelf._id ? 'btn-primary' : 'glass-effect'}
                            style={{
                                width: '100%', padding: '1rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                border: activeShelf?._id === shelf._id ? 'none' : '1px solid var(--glass-border)',
                                color: activeShelf?._id === shelf._id ? 'white' : 'inherit', cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Book size={18} />
                                <span>{shelf.name}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{shelf.books.length}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleCreateShelf} style={{ marginTop: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="New custom shelf..."
                            value={newShelfName}
                            onChange={(e) => setNewShelfName(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                        />
                        <button type="submit" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}>
                            <Plus size={20} />
                        </button>
                    </div>
                </form>
            </aside>

            <main>
                {activeShelf ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2.5rem' }}>{activeShelf.name}</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>{activeShelf.books.length} books in this shelf</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2rem' }}>
                            {activeShelf.books.map(book => (
                                <div key={book._id} className="glass-effect" style={{ overflow: 'hidden' }}>
                                    <Link to={`/book/${book._id}`}>
                                        <img src={book.coverImage} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                                    </Link>
                                    <div style={{ padding: '0.75rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{book.author}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activeShelf.books.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                                <p>No books in this shelf yet.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <p>Select a shelf to view your books.</p>
                    </div>
                )}
            </main>
        </div >
    );
};

export default Shelves;
