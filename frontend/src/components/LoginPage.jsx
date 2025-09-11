import React from 'react';
import AuthService from './AuthService';
import './LoginPage.css';

const LoginPage = () => {
    const handleLogin = () => {
        AuthService.initiateLogin();
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome to Rainbow Px</h1>
                    <p>Your profile discovery platform</p>
                </div>

                <div className="login-content">
                    <div className="login-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" fill="url(#gradient)" />
                            <path d="M12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6Z" fill="white" />
                            <path d="M6 18.5C6 15.4624 8.46243 13 11.5 13H12.5C15.5376 13 18 15.4624 18 18.5V19H6V18.5Z" fill="white" />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#667eea" />
                                    <stop offset="100%" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h2>Sign in to continue</h2>
                    <p className="login-subtitle">Access your profile discovery dashboard</p>

                    <button
                        className="login-button"
                        onClick={handleLogin}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.766 12.276c0-.815-.07-1.605-.2-2.357H12.24v4.456h6.487c-.278 1.496-1.125 2.764-2.397 3.616v3.001h3.878c2.27-2.089 3.578-5.166 3.578-8.716z" fill="#4285F4" />
                            <path d="M12.24 24c3.24 0 5.956-1.075 7.942-2.907l-3.878-3.002c-1.075.722-2.45 1.148-4.064 1.148-3.125 0-5.768-2.11-6.714-4.948H1.54v3.098C3.518 21.344 7.612 24 12.24 24z" fill="#34A853" />
                            <path d="M5.526 14.291c-.243-.722-.381-1.49-.381-2.291s.138-1.569.381-2.291V6.611H1.54C.561 8.569 0 10.235 0 12s.561 3.431 1.54 5.389l3.986-3.098z" fill="#FBBC05" />
                            <path d="M12.24 4.758c1.764 0 3.347.605 4.595 1.792l3.447-3.448C18.19 1.19 15.474 0 12.24 0 7.612 0 3.518 2.656 1.54 6.611l3.986 3.097c.946-2.838 3.589-4.95 6.714-4.95z" fill="#EA4335" />
                        </svg>
                        Continue with Microsoft
                    </button>
                </div>

                <div className="login-footer">
                    <p>Secure authentication powered by Microsoft</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
