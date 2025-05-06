// API Configuration
const API_URL = 'http://localhost:8000';

// Check for remembered credentials on page load
document.addEventListener('DOMContentLoaded', function() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const { email, password } = JSON.parse(remembered);
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        document.getElementById('rememberMe').checked = true;
    }

    // If there's a valid token, redirect to appropriate page
    const token = localStorage.getItem('token');
    if (token) {
        const userRole = localStorage.getItem('userRole');
        redirectToUserDashboard(userRole);
    }
});

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorMessage = document.getElementById('errorMessage');
    
    // Reset error message
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    
    try {
        console.log('Attempting login with:', { email });
        
        const response = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit', // Changed to 'omit' to avoid CORS issues
            body: new URLSearchParams({
                'username': email,
                'password': password
            })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed. Please check your credentials.');
        }
        
        // Store token and user info
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.access_token);
        storage.setItem('userRole', data.user_role || data.role);
        storage.setItem('userEmail', email);

        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
        } else {
            localStorage.removeItem('rememberedUser');
        }

        // Show success message
        showToast('Login successful! Redirecting...', 'success');

        // Redirect based on role
        setTimeout(() => {
            redirectToUserDashboard(data.user_role || data.role);
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed. Please try again.', 'error');
        errorMessage.textContent = error.message || 'Login failed. Please try again.';
        errorMessage.style.display = 'block';
    }
}

// Redirect user based on role
function redirectToUserDashboard(role) {
    const roleRedirects = {
        'admin': '/html/admin.html',
        'teacher': '/html/teacher.html',
        'student': '/html/student.html',
        'parent': '/html/parent.html'
    };

    const redirectUrl = roleRedirects[role];
    if (redirectUrl) {
        window.location.href = redirectUrl;
    } else {
        showToast('Unknown user role. Please contact support.', 'error');
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    
    // Add show class
    toast.classList.add('show');
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
} 