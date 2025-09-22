import axios from 'axios';
import {ACCESS_TOKEN, REFRESH_TOKEN} from './constants.js'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem(REFRESH_TOKEN);
                if (!refresh) throw error;

                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/token/refresh/`, { refresh });
                const newAccess = res.data.access;

                localStorage.setItem(ACCESS_TOKEN, newAccess);
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;

                return api(originalRequest);
            } catch (refreshErr) {
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
            }
        }

        return Promise.reject(error);
    }
);

export default api