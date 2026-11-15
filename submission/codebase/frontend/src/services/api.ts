import axios from 'axios';

const isProduction = import.meta.env.PROD;
const API_BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:4000/api');
const GATEWAY_API_KEY = import.meta.env.VITE_GATEWAY_API_KEY || 'dev-secret-key-12345';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': GATEWAY_API_KEY
  },
  timeout: 10000
});

// Automatically inject JWT Bearer token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleet_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for centralized error parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.error?.code?.startsWith('AUTH_')) {
      // Clear expired session
      localStorage.removeItem('fleet_token');
      localStorage.removeItem('fleet_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
