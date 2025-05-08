// User Information Management
class UserInfo {
    static async getCurrentUser() {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');
        
        console.log('Checking auth state:', { hasToken: !!token, hasEmail: !!userEmail });
        
        if (!token || !userEmail) {
            console.log('No token or email found, redirecting to login');
            window.location.href = './login.html';
            return null;
        }

        try {
            console.log('Fetching user info with token:', token.substring(0, 10) + '...');
            
            const response = await fetch('http://localhost:8000/auth/me', {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'http://127.0.0.1:5500'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.status === 401) {
                console.log('Unauthorized access, clearing credentials');
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                window.location.href = './login.html';
                return null;
            }

            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`Failed to get user info: ${response.status}`);
            }

            const userData = await response.json();
            console.log('User data received:', userData);
            return userData;
        } catch (error) {
            console.error('Error getting user info:', error);
            if (error.message.includes('401')) {
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                window.location.href = './login.html';
            }
            return null;
        }
    }

    static async updateUserDisplay() {
        try {
            console.log('Starting user display update');
            const userData = await this.getCurrentUser();
            console.log('Retrieved user data:', userData);
            
            if (!userData) {
                console.log('No user data available');
                return;
            }

            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            
            console.log('Found DOM elements:', { 
                hasAvatar: !!userAvatar, 
                hasUserName: !!userName 
            });
            
            if (userAvatar) {
                const initials = userData.full_name
                    .split(' ')
                    .map(name => name[0])
                    .join('')
                    .toUpperCase();
                console.log('Setting avatar initials:', initials);
                userAvatar.textContent = initials;
            }
            
            if (userName) {
                console.log('Setting user name:', userData.full_name);
                userName.textContent = userData.full_name;
            }
        } catch (error) {
            console.error('Error updating user display:', error);
        }
    }
}

// Initialize user info when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, updating user display');
    UserInfo.updateUserDisplay();
}); 