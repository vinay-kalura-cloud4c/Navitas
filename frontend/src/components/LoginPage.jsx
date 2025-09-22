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
                    <h1>Welcome to Talent Acquisition</h1>
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

                    <button className="login-button" onClick={handleLogin}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23">
                            <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                            <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                            <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                            <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
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
