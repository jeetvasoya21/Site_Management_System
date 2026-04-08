import axios from 'axios';

const API_BASE_URL = '/api/v1';
const authRoutes = ['/auth/login', '/auth/register', '/auth/signup', '/auth/refresh-token', '/auth/refresh', '/auth/logout'];

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let refreshPromise = null;

const shouldSkipRefresh = (url = '') => authRoutes.some((route) => url.includes(route));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise = refreshPromise || api.post('/auth/refresh-token');
        await refreshPromise;
        refreshPromise = null;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
