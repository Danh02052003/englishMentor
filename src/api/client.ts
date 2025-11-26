import axios from 'axios';

import useAuthStore from '../store/useAuthStore';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) {
        try {
          const res = await axios.post('/api/auth/refresh', { refresh_token: refresh });
          useAuthStore.getState().setAuth(res.data);
          original.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api(original);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

