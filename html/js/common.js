// Database Interaction Utilities

// Function to make API calls
async function makeRequest(url, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

// Authentication functions
async function login(username, password) {
    return await makeRequest('/api/login', 'POST', { username, password });
}

async function logout() {
    return await makeRequest('/api/logout', 'POST');
}

// Student functions
async function getStudentProfile(studentId) {
    return await makeRequest(`/api/students/${studentId}`);
}

async function updateStudentProfile(studentId, data) {
    return await makeRequest(`/api/students/${studentId}`, 'PUT', data);
}

// Teacher functions
async function getTeacherProfile(teacherId) {
    return await makeRequest(`/api/teachers/${teacherId}`);
}

async function updateTeacherProfile(teacherId, data) {
    return await makeRequest(`/api/teachers/${teacherId}`, 'PUT', data);
}

// Admin functions
async function getAllUsers() {
    return await makeRequest('/api/users');
}

async function createUser(userData) {
    return await makeRequest('/api/users', 'POST', userData);
}

async function updateUser(userId, userData) {
    return await makeRequest(`/api/users/${userId}`, 'PUT', userData);
}

async function deleteUser(userId) {
    return await makeRequest(`/api/users/${userId}`, 'DELETE');
}

// Library functions
async function getBooks() {
    return await makeRequest('/api/library/books');
}

async function borrowBook(bookId, userId) {
    return await makeRequest('/api/library/borrow', 'POST', { bookId, userId });
}

async function returnBook(bookId, userId) {
    return await makeRequest('/api/library/return', 'POST', { bookId, userId });
}

// Parent functions
async function getChildrenInfo(parentId) {
    return await makeRequest(`/api/parents/${parentId}/children`);
}

async function getChildProgress(childId) {
    return await makeRequest(`/api/students/${childId}/progress`);
}

// Form validation utility
function validateForm(formData, rules) {
    const errors = {};
    
    for (const [field, value] of Object.entries(formData)) {
        if (rules[field]) {
            if (rules[field].required && !value) {
                errors[field] = 'This field is required';
            }
            if (rules[field].minLength && value.length < rules[field].minLength) {
                errors[field] = `Minimum length is ${rules[field].minLength} characters`;
            }
            if (rules[field].pattern && !rules[field].pattern.test(value)) {
                errors[field] = rules[field].message || 'Invalid format';
            }
        }
    }
    
    return errors;
}

// Toast notification utility
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
} 