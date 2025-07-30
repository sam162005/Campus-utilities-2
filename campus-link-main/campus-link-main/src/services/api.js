// client/src/services/api.js
import axios from 'axios';

// This should match the port your backend is running on for local development.
// In production (e.g., Vercel), this will be overridden by the VITE_REACT_APP_BACKEND_URL environment variable.
const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5001/api';

// Create a centralized axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json' // Ensure Content-Type is set for all requests
    }
});

// Use an interceptor to send the auth token with every protected request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, error => {
    // Handle request errors here
    return Promise.reject(error);
});

export default api;
