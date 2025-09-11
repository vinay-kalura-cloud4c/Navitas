// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import AuthService from './AuthService';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await AuthService.getCurrentUser();
            setUser(userData?.user);
            setLoading(false);
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        AuthService.logout();
    };

    if (loading) return <div>Loading...</div>;

    if (!user) {
        window.location.href = '/login';
        return null;
    }

    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
