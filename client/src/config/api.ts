import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
                config.headers['Auth'] = token;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                if (typeof window !== 'undefined') {
                    const url = error.config?.url || '';
                    const isOptionalEndpoint = url.includes('/capacity') || url.includes('/integrations') || url.includes('/tokens');
                    const wasLoggedIn = !!localStorage.getItem('authToken');
                    if (wasLoggedIn && !isOptionalEndpoint) {
                        // Clear user session only for critical authenticated failures
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        window.dispatchEvent(new Event('auth-change'));
                        console.warn('Authentication token expired. Logging out gracefully.');
                    }
                }
            } else if (
                error.response.status === 403 &&
                (error.response.data?.code === 'QUOTA_EXCEEDED' ||
                 error.response.data?.code === 'PLAN_LIMIT_REACHED' ||
                 error.response.data?.errorType === 'CAPACITY_REACHED' ||
                 error.response.data?.errorType === 'IMAGE_LIMIT_REACHED' ||
                 error.response.data?.code === 'VIDEO_TOO_LONG' ||
                 error.response.data?.isExceeded)
            ) {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-capacity-modal', {
                        detail: error.response.data
                    }));
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;