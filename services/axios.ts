import { router } from 'expo-router';
import axios from 'axios';
import { storage } from '@/stores/mmkv';

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async config => {
    // const token = await AsyncStorage.getItem('token');
    const token = storage.getString('token') ?? null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.log('Authentication error. Please log in again.', 'error');
      // await AsyncStorage.clear();
      storage.clearAll();
      setTimeout(() => {
        router.replace('/' as any);
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
