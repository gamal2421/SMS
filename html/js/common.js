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

// Utility Functions
const Utils = {
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatTime(time) {
        return new Date(time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    },

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const re = /^\d{3}-\d{3}-\d{4}$/;
        return re.test(phone);
    }
};

// Modal Management
const Modal = {
    currentModal: null,

    show(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'block';
        this.currentModal = modal;
        document.body.classList.add('modal-open');
    },

    hide(modalId) {
        const modal = modalId ? document.getElementById(modalId) : this.currentModal;
        if (!modal) return;

        modal.style.display = 'none';
        this.currentModal = null;
        document.body.classList.remove('modal-open');
    },

    init() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hide(e.target.id);
            }
        });

        // Close modal when clicking close button
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    this.hide(modal.id);
                }
            });
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.hide();
            }
        });
    }
};

// Form Validation
const FormValidator = {
    validateForm(form) {
        let isValid = true;
        const errors = [];

        form.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.hasAttribute('required') && !field.value.trim()) {
                isValid = false;
                errors.push(`${field.name || field.id} is required`);
                this.showFieldError(field, 'This field is required');
            } else {
                this.clearFieldError(field);
            }

            if (field.type === 'email' && field.value && !Utils.validateEmail(field.value)) {
                isValid = false;
                errors.push('Invalid email format');
                this.showFieldError(field, 'Invalid email format');
            }

            if (field.type === 'tel' && field.value && !Utils.validatePhone(field.value)) {
                isValid = false;
                errors.push('Invalid phone format (use: 123-456-7890)');
                this.showFieldError(field, 'Invalid phone format (use: 123-456-7890)');
            }
        });

        return { isValid, errors };
    },

    showFieldError(field, message) {
        field.classList.add('invalid');
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.textContent = message;
        } else {
            const div = document.createElement('div');
            div.className = 'error-message';
            div.textContent = message;
            field.parentNode.insertBefore(div, field.nextSibling);
        }
    },

    clearFieldError(field) {
        field.classList.remove('invalid');
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.textContent = '';
        }
    },

    setupFormValidation(form) {
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });

            field.addEventListener('blur', () => {
                if (field.hasAttribute('required') && !field.value.trim()) {
                    this.showFieldError(field, 'This field is required');
                }
            });
        });
    }
};

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
    Modal.init();
}); 