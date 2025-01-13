import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const register = (email: string, password: string) => API.post('/users/register', { email, password });
export const login = (email: string, password: string) => API.post('/users/login', { email, password });
export const fetchUserProfile = () => API.get('/users/profile');