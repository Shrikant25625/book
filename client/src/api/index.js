import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://book-1-mfoo.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export const authAPI = {
    login: () => window.location.href = `${BASE_URL}/auth/google`,
    logout: () => api.get('/auth/logout')
};

export const userAPI = {
    getMe: () => api.get('/users/me'),
    getStats: () => api.get('/users/stats'),
    getReviews: () => api.get('/users/reviews')
};

export const bookAPI = {
    getTrending: () => api.get('/books/trending'),
    search: (q) => api.get(`/books/search?q=${q}`),
    getById: (id) => api.get(`/books/${id}`)
};

export const shelfAPI = {
    getAll: () => api.get('/shelves'),
    getById: (id) => api.get(`/shelves/${id}`),
    create: (name) => api.post('/shelves', { name }),
    addBook: (shelfId, bookId) => api.post('/shelves/add', { shelfId, bookId }),
    moveBook: (bookId, targetShelfName) => api.post('/shelves/move', { bookId, targetShelfName })
};

export const reviewAPI = {
    create: (data) => api.post('/reviews', data),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    getByBook: (bookId) => api.get(`/reviews/book/${bookId}`)
};

export default api;
