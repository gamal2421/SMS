// Mock user accounts
const users = {
    'admin@school.com': {
        password: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        redirectUrl: 'admin.html'
    },
    'teacher@school.com': {
        password: 'teacher123',
        role: 'teacher',
        firstName: 'Jane',
        lastName: 'Doe',
        redirectUrl: 'teacher.html'
    },
    'student@school.com': {
        password: 'student123',
        role: 'student',
        firstName: 'John',
        lastName: 'Smith',
        grade: '10-A',
        redirectUrl: 'student.html'
    },
    'parent@school.com': {
        password: 'parent123',
        role: 'parent',
        firstName: 'David',
        lastName: 'Wilson',
        children: ['Mike Wilson'],
        redirectUrl: 'parent.html'
    }
};

// Check for remembered credentials on page load
document.addEventListener('DOMContentLoaded', function() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const { email, password } = JSON.parse(remembered);
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        document.getElementById('rememberMe').checked = true;
    }
});

// Login form submission handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorMessage = document.getElementById('errorMessage');
    
    // Reset error message
    errorMessage.textContent = '';
    
    // Check if user exists
    if (users[email]) {
        // Check password
        if (users[email].password === password) {
            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
            } else {
                localStorage.removeItem('rememberedUser');
            }

            // Store user info in session storage
            const userInfo = { ...users[email] };
            delete userInfo.password; // Don't store password
            sessionStorage.setItem('currentUser', JSON.stringify(userInfo));
            
            // Show success message
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                window.location.href = users[email].redirectUrl;
            }, 1500);
        } else {
            errorMessage.textContent = 'Invalid password';
            showToast('Invalid password', 'error');
        }
    } else {
        errorMessage.textContent = 'User not found';
        showToast('User not found', 'error');
    }
});

// Show password toggle
document.getElementById('showPassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

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