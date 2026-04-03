import axios from 'axios';

const api = axios.create({
    // timeout: 30000,
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    // baseURL:'https://Paperxify-j60n.onrender.com/api',
    // baseURL: 'https://Paperxify.onrender.com/api',
    // baseURL: 'https://Paperxify-ybzq.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle 401 Unauthorized (Token Expiry) gracefully
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                const wasLoggedIn = !!localStorage.getItem('authToken');
                if (wasLoggedIn) {
                    // Clear user session from storage
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    
                    // Dispatch custom event to notify components (like Providers.tsx) to update state
                    window.dispatchEvent(new Event('auth-change'));
                    
                    console.warn('Authentication token expired. Logging out gracefully.');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;