import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ic_token');
      localStorage.removeItem('ic_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  sendOtp: (phone) => api.post('/api/auth/send-otp', { phone }),
  verifyOtp: (phone, otp, name) => api.post('/api/auth/verify-otp', { phone, otp, name }),
};

export const documentApi = {
  getAll: () => api.get('/api/documents'),
  getById: (id) => api.get(`/api/documents/${id}`),
  upload: (file, onProgress) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/documents/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
  },
  delete: (id) => api.delete(`/api/documents/${id}`),
  getStats: () => api.get('/api/documents/stats'),
};

export const batchApi = {
  start: () => api.post('/api/batch/process'),
  getProgress: () => api.get('/api/batch/progress'),
};

export const logsApi = {
  getLogs: () => api.get('/api/logs'),
  clear: () => api.delete('/api/logs'),
};

export default api;
