import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.131:8000/api'; // Android emulator localhost
// const API_BASE_URL = 'http://localhost:8000/api'; // iOS simulator
// const API_BASE_URL = 'https://your-production-url.com/api'; // Production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/accounts/register/', { username, email, password }),

  login: (username: string, password: string) =>
    api.post('/accounts/login/', { username, password }),

  getProfile: () =>
    api.get('/accounts/profile/'),
};

// News APIs
export const newsAPI = {
  createSubmission: (formData: FormData) =>
    api.post('/news/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  getSubmissions: () =>
    api.get('/news/list/'),

  getSubmissionDetail: (id: number) =>
    api.get(`/news/${id}/`),

  getDashboardSummary: () =>
    api.get('/news/dashboard-summary/'),

  deleteSubmission: (id: number) =>
    api.delete(`/news/${id}/delete/`),
};

export default api;
