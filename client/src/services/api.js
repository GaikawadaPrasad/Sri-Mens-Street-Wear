import axios from 'axios';

// Detect API URL from env or localhost:5050
let customApiUrl = import.meta.env.VITE_API_URL || '';
if (customApiUrl) {
  customApiUrl = customApiUrl.replace(/\/+$/, '');
  if (!customApiUrl.endsWith('/api')) {
    customApiUrl += '/api';
  }
}

const API_BASE_URL = customApiUrl ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5050/api'
    : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
