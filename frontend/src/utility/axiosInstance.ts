import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000',
  timeout: 5000, // กำหนด timeout (ถ้ามี)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: ใส่ token ใน header ทุกครั้งที่เรียก API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // หรือดึงจาก context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: จัดการ response error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized! Please login again.');
      // อาจจะ redirect ไปหน้า login
    }
    return Promise.reject(error);
  }
);

export default api;