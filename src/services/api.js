import axios from 'axios';

const api = axios.create({
    baseURL: 'https://examination-focused-smart-attendance-ty4i.onrender.com/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;