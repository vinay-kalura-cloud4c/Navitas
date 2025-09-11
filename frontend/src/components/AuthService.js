// AuthService.js
class AuthService {
    async initiateLogin() {
        try {
            const response = await fetch('https://localhost:8000/auth/login', {
                credentials: 'include'
            });

            const data = await response.json();

            // Redirect user to Microsoft login
            window.location.href = data.auth_url;

        } catch (error) {
            console.error('Login initiation failed:', error);
        }
    }

    async getCurrentUser() {
        try {
            const response = await fetch('https://localhost:8000/auth/user', {
                credentials: 'include'
            });

            if (response.ok) {
                return await response.json();
            }

            return null;
        } catch (error) {
            console.error('Get user failed:', error);
            return null;
        }
    }

    async logout() {
        try {
            await fetch('https://localhost:8000/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}

export default new AuthService();
