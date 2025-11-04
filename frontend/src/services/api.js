import axios from 'axios';
import AuthService from '../components/AuthService';

const api = axios.create({
    baseURL: 'http://your-api-url.com', // Replace with your API base URL
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Clear authentication state
            await AuthService.logout();

            // Show alert to user
            alert('Your session has expired. Please login again.');

            // Redirect to login by reloading the page (this will trigger the auth check in App.js)
            window.location.href = '/';

            return Promise.reject(error);
        }

        // Handle other error codes if needed
        return Promise.reject(error);
    }
);

export default api;
