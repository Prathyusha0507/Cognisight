import axios from 'axios';

//const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  changePassword: (data) => api.post('/auth/change-password', data)
};

export const chatAPI = {
  sendMessage: (message) => api.post('/chat/send', { message }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history')
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data)
};

export default api;
