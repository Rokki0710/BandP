import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Перехват 401 — автоматический редирект на логин
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('❌ 401 Unauthorized — перенаправляем на логин');

      // Очищаем токен
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Редирект на страницу логина
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Добавляем токен в каждый запрос
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;