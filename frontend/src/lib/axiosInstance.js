
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Your Django API base URL
    timeout: 5000, // Optional: request timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token to headers
axiosInstance.interceptors.request.use(
    async config => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// You might also want a response interceptor to handle token refresh or logout on 401/403
// For now, focus on the request interceptor to get the token sent.

export default axiosInstance;