import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // We store the token in a cookie named 'token' for easy extraction
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Globally handle 401 Unauthorized if needed
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      // If we are on client side, we might want to redirect, but usually handled by AuthContext
    }
    return Promise.reject(error);
  }
);
