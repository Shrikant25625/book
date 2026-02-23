import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api';
import { Search, User, LogOut, BookOpen } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();
    const [search, setSearch] = React.useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search.trim()) {
                navigate(`/?q=${search}`);
            } else if (search === '') {
                navigate('/');
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) navigate(`/?q=${search}`);
    };

    return (
        <nav className="glass-effect" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 'bold', fontSize: '1.25rem' }}>
                <BookOpen size={24} color="#38bdf8" />
                <span>Biblio<span style={{ color: '#38bdf8' }}>Space</span></span>
            </Link>

            <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search books or authors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 2.5rem 0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
                <Search size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {user ? (
                    <>
                        <Link to="/shelves" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>My Shelves</Link>
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                            <img src={user.profilePic} alt={user.displayName} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
                            <span style={{ fontWeight: 500 }}>{user.displayName.split(' ')[0]}</span>
                        </Link>
                    </>
                ) : (
                    <button onClick={() => authAPI.login()} className="btn-primary" style={{ cursor: 'pointer' }}>Sign in with Google</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
