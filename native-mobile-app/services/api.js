import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Admin Panel API URL - Mobile hotspot এ connected
const API_URL = 'http://10.206.138.20:3000'; // Mobile hotspot network IP

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API Functions
export const apiService = {
  // Auth
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  },

  // Groups
  getGroups: async () => {
    const response = await api.get('/api/groups');
    return response.data;
  },

  // Payments
  getPayments: async () => {
    const response = await api.get('/api/payments');
    return response.data;
  },

  // Order Limits
  getOrderLimits: async () => {
    const response = await api.get('/api/order-limits');
    return response.data;
  },

  updateOrderLimits: async (limits) => {
    const response = await api.put('/api/order-limits', limits);
    return response.data;
  },
};

export default api;
