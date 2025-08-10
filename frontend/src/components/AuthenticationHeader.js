// AuthenticationHeader.tsx
import React, { useState, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';

// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_CLIENT_ID || "c97dc8fe-26ae-40a9-8681-906ebd65211b",
        authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID || "512ec501-cb12-46d1-bbef-7f52f8ad2df8"}`,
        redirectUri: process.env.REACT_APP_REDIRECT_URI || "http://localhost:3001"
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

const loginRequest = {
    scopes: [
        "https://graph.microsoft.com/Calendars.ReadWrite",
        "https://graph.microsoft.com/OnlineMeetings.ReadWrite",
        "https://graph.microsoft.com/User.Read",
        "https://graph.microsoft.com/Mail.Send",
        "https://graph.microsoft.com/OnlineMeetingTranscript.Read.All"
    ],
    prompt: "select_account"
};

const msalInstance = new PublicClientApplication(msalConfig);
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

const AuthenticationHeader = ({ onAuthChange }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [msalInitialized, setMsalInitialized] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const initializeMsal = async () => {
            try {
                await msalInstance.initialize();
                setMsalInitialized(true);
                console.log('MSAL initialized successfully');

                // Check if user is already logged in
                const accounts = msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    setUserInfo(accounts[0]);
                    await acquireTokenSilently();
                }

                await checkAuthStatus();
            } catch (error) {
                console.error('MSAL initialization failed:', error);
            }
        };

        initializeMsal();
    }, []);

    useEffect(() => {
        onAuthChange?.(isAuthenticated);
    }, [isAuthenticated, onAuthChange]);

    const acquireTokenSilently = async () => {
        try {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length === 0) return;

            const silentRequest = {
                ...loginRequest,
                account: accounts[0]
            };

            const response = await msalInstance.acquireTokenSilent(silentRequest);
            await sendTokenToBackend(response.accessToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.log('Silent token acquisition failed:', error);
        }
    };

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth-status`);
            const data = await response.json();
            setIsAuthenticated(data.authenticated);
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
        }
    };

    const sendTokenToBackend = async (accessToken) => {
        const response = await fetch(`${BACKEND_URL}/set-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',
            body: JSON.stringify({ access_token: accessToken })
        });

        if (!response.ok) {
            throw new Error('Failed to authenticate with backend');
        }

        return response;
    };

    const handleLogin = async () => {
        if (!msalInitialized) {
            alert('Authentication system is still loading. Please try again in a moment.');
            return;
        }

        setAuthLoading(true);
        try {
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            const accessToken = loginResponse.accessToken;

            await sendTokenToBackend(accessToken);
            setIsAuthenticated(true);
            setUserInfo(loginResponse.account);
            console.log('Authentication successful');

        } catch (error) {
            console.error('Login failed:', error);
            alert('Authentication failed. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!msalInitialized) return;

        try {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                await msalInstance.logoutPopup({
                    account: accounts[0]
                });
            }

            await fetch(`${BACKEND_URL}/logout`, { method: 'POST' });
            setIsAuthenticated(false);
            setUserInfo(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">Saved Profiles</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Authentication Status */}
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${!msalInitialized ? 'bg-yellow-500' :
                                    isAuthenticated ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            <span className="text-sm font-medium text-gray-700">
                                {!msalInitialized ? 'Initializing...' :
                                    isAuthenticated ? `Connected as ${userInfo?.name || 'User'}` : 'Not Connected'}
                            </span>
                        </div>

                        {/* Authentication Button */}
                        {!isAuthenticated ? (
                            <button
                                onClick={handleLogin}
                                disabled={authLoading || !msalInitialized}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {authLoading ? 'Connecting...' :
                                    !msalInitialized ? 'Please wait...' : 'Connect to Microsoft'}
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                disabled={!msalInitialized}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>

                {/* Authentication Required Banner */}
                {!isAuthenticated && (
                    <div className="pb-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-amber-700">
                                        Some features require Microsoft authentication. Connect your account to schedule meetings, send emails, and access transcripts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthenticationHeader;
