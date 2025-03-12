import axios from 'axios';

// API Instance สำหรับ Authentication Service
const apiAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AUTH_URL || 'https://localhost:5000',
  timeout: 5000, // กำหนด timeout (ถ้ามี)
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Instance สำหรับ Room Management Service
const apiRoom = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ROOM_URL || 'https://localhost:5001',
  timeout: 5000, // กำหนด timeout (ถ้ามี)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: ใส่ token ใน header ทุกครั้งที่เรียก API (สำหรับทั้ง apiAuth และ apiRoom)
const setAuthToken = (config: any) => {
  const token = localStorage.getItem('token'); // หรือดึงจาก context
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiAuth.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));
apiRoom.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));

// Interceptor: จัดการ response error (สำหรับทั้ง apiAuth และ apiRoom)
const handleResponseError = (error: any) => {
  if (error.response?.status === 401) {
    console.error('Unauthorized! Please login again.');
    // อาจจะ redirect ไปหน้า login (เช่น window.location.href = '/login')
  } else if (error.response?.status === 500) {
    console.error('Server error:', error.message);
  }
  return Promise.reject(error);
};

apiAuth.interceptors.response.use((response) => response, handleResponseError);
apiRoom.interceptors.response.use((response) => response, handleResponseError);

export { apiAuth, apiRoom };