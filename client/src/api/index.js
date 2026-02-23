import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

export const authAPI = {
    login: () => window.location.href = 'http://localhost:5000/api/auth/google',
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
