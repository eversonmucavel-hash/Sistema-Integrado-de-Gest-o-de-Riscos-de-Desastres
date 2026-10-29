import axios from 'axios';
import { cache } from './cache';

const API_URL = 'http://192.168.201.198:9000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // 10 segundos
});

// Interceptor: adicionar token + tentar cache em caso de falha
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        // Se for um GET bem-sucedido, guardar no cache
        if (response.config.method === 'get') {
            const key = response.config.url + JSON.stringify(response.config.params || {});
            cache.set(key, response.data);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Se for erro de rede/timeout num GET → tentar cache
        if (
            originalRequest.method === 'get' &&
            (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')
        ) {
            const key = originalRequest.url + JSON.stringify(originalRequest.params || {});
            const cachedData = cache.get(key, true); // ignorar TTL

            if (cachedData) {
                console.log(`[Cache] A usar dados offline para: ${originalRequest.url}`);
                return {
                    data: cachedData,
                    status: 200,
                    statusText: 'OK (Cache)',
                    headers: {},
                    config: originalRequest,
                    isCached: true,
                };
            }
        }

        // 401 → tentar refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });
                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;