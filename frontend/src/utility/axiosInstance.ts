import axios from 'axios';
import https from 'https';

// API Instance สำหรับ Authentication Service
const apiAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AUTH_URL || 'https://localhost:5000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // ใช้ใน dev เท่านั้น
  }),
});

// API Instance สำหรับ Room Request Service
const apiRoom = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ROOM_URL || 'https://localhost:5001',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // ใช้ใน dev เท่านั้น
  }),
});

// Interceptor: ใส่ token ใน header
const setAuthToken = (config: any) => {
  const token = localStorage.getItem('token');
  console.log('Token in interceptor:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiAuth.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));
apiRoom.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));

// Interceptor: จัดการ response error
const handleResponseError = (error: any) => {
  if (error.response?.status === 401) {
    console.error('Unauthorized! Please login again.');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

apiAuth.interceptors.response.use((response) => response, handleResponseError);
apiRoom.interceptors.response.use((response) => response, handleResponseError);

export { apiAuth, apiRoom };