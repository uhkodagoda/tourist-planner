import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Attach the admin token (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
