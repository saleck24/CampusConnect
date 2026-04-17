import axios from 'axios';

// Instance de base
const api = axios.create({
    baseURL: 'http://localhost:5000/api/',
});

// Intercepteur pour inclure le token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
