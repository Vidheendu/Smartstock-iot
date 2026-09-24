import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach smartstock_token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartstock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      const isAuthRoute = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('smartstock_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
