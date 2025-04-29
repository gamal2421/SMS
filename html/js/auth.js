// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout user
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Check if user has required role
function hasRole(requiredRole) {
    const user = getCurrentUser();
    return user && user.role === requiredRole;
}

// Require login for a page
function requireAuth() {
    if (!getCurrentUser()) {
        window.location.href = 'login.html';
    }
}

// Require specific role for a page
function requireRole(requiredRole) {
    const user = getCurrentUser();
    if (!user || user.role !== requiredRole) {
        window.location.href = 'login.html';
    }
}

// Example usage:
// const response = await apiCall('http://localhost:3000/api/students', {
//     method: 'GET'
// });
// const data = await response.json(); 