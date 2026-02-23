import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import BookDetail from './pages/BookDetail';
import Shelves from './pages/Shelves';
import Profile from './pages/Profile';
import './styles/index.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                    <Navbar />
                    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                        <Routes>
                            <Route path="/" element={<Homepage />} />
                            <Route path="/book/:id" element={<BookDetail />} />
                            <Route path="/shelves" element={<Shelves />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
