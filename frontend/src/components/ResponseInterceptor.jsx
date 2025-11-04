import { useEffect, useRef } from 'react';
import axios from 'axios';
import AuthService from './AuthService';

export const ResponseInterceptor = ({ onUnauthorized }) => {
    const interceptorId = useRef(null);

    useEffect(() => {
        // Set up response interceptor
        interceptorId.current = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Clear user session
                    await AuthService.logout();

                    // Call the callback to update App.js state
                    onUnauthorized();

                    return Promise.reject(error);
                }

                return Promise.reject(error);
            }
        );

        // Cleanup: remove interceptor when component unmounts
        return () => {
            if (interceptorId.current !== null) {
                axios.interceptors.response.eject(interceptorId.current);
            }
        };
    }, [onUnauthorized]);

    return null; // This component doesn't render anything
};
