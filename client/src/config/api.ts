import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                if (typeof window !== 'undefined') {
                    const wasLoggedIn = !!localStorage.getItem('authToken');
                    if (wasLoggedIn) {
                        // Clear user session from storage
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        
                        // Dispatch custom event to notify components to update state
                        window.dispatchEvent(new Event('auth-change'));
                        console.warn('Authentication token expired. Logging out gracefully.');
                    }
                }
            } else if (error.response.status === 403 && error.response.data?.code === 'QUOTA_EXCEEDED') {
                if (typeof window !== 'undefined') {
                    toast.error(error.response.data.message || 'Plan quota limit reached', {
                        action: {
                            label: 'Upgrade Plan',
                            onClick: () => { window.location.href = '/pricing'; }
                        },
                        duration: 8000,
                    });
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;