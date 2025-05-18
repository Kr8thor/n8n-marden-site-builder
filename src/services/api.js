// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to authenticated requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token refresh interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // We would need a refresh token endpoint in n8n for this to work
        // For now, just logout on auth error
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Content API
export const fetchPosts = async (page = 1, perPage = 10) => {
  try {
    const response = await api.get('/content', {
      params: { page, perPage }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchPost = async (slug) => {
  try {
    const response = await api.get(`/content/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post '${slug}':`, error);
    throw error;
  }
};

// Authentication API
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth', { username, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
};

// Form submission API
export const submitForm = async (formData) => {
  try {
    const response = await api.post('/forms/submit', formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};

// Menu API
export const fetchMenu = async () => {
  try {
    const response = await api.get('/menu');
    return response.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};

export default api;
