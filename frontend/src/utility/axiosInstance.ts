import axios from 'axios';
import https from 'https';

// API Instance Authentication Service
const apiAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AUTH_URL || 'http://localhost:5000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, 
  }),
});

// API Instance Room Request Service
<<<<<<< Updated upstream
const apiReq = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ROOM_URL || 'http://localhost:5001',
=======
const apiRoom = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ROOM_URL || 'https://localhost:5001',

>>>>>>> Stashed changes
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, 
  }),
});

<<<<<<< Updated upstream
const apiRoom = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ROOM_MGMT_URL || 'http://localhost:5002', // ชี้ไปที่ room_mgmt
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // ใช้ใน dev เท่านั้น
  }),
});

=======

const apiupdateprofile = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_UPDATEPROFILE_URL || 'https://localhost:5000',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' 

  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, 
  }),
});

// Set the Authorization token

>>>>>>> Stashed changes
const setAuthToken = (config: any) => {
  const token = localStorage.getItem('token');
  console.log('Token in interceptor:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiAuth.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));
apiReq.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));
apiRoom.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));
apiupdateprofile.interceptors.request.use(setAuthToken, (error) => Promise.reject(error));

const handleResponseError = (error: any) => {
  if (error.response?.status === 401) {
    console.error('Unauthorized! Please login again.');
    window.location.href = '/signin';
  }
  return Promise.reject(error);
};

apiAuth.interceptors.response.use((response) => response, handleResponseError);
apiReq.interceptors.response.use((response) => response, handleResponseError);
apiRoom.interceptors.response.use((response) => response, handleResponseError);
apiupdateprofile.interceptors.response.use((response) => response, handleResponseError);

<<<<<<< Updated upstream
export { apiAuth, apiReq, apiRoom };
=======
export {
  apiAuth, apiRoom,
  // API Instance Room Request Service
  apiupdateprofile
};
>>>>>>> Stashed changes
