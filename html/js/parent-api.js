// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const TOKEN_KEY = 'parent_auth_token';
        
// API Endpoints
const ENDPOINTS = {
    LOGIN: '/auth/token',
    CHILDREN: '/parent/children',
    ANNOUNCEMENTS: '/parent/announcements',
    GRADES: '/parent/grades',
    SCHEDULE: '/parent/schedule',
    FEES: '/parent/fees',
    COMMUNICATIONS: '/parent/messages',
    PROFILE: '/parent/profile'
};

// Utility Functions
const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

const setAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);

const removeAuthToken = () => localStorage.removeItem(TOKEN_KEY);

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
});

// API Error Handler
const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.status === 401) {
        // Unauthorized - clear token and redirect to login
        removeAuthToken();
        window.location.href = '/login.html';
            }
    throw error;
};

// API Calls
async function loginParent(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        setAuthToken(data.access_token);
        return data;
    } catch (error) {
        handleApiError(error);
    }
}

async function getChildren() {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CHILDREN}`, {
            headers: getAuthHeaders()
        });

            if (!response.ok) {
            throw new Error('Failed to fetch children data');
            }

        return await response.json();
        } catch (error) {
        handleApiError(error);
        }
    }

async function getAnnouncements() {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ANNOUNCEMENTS}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcements');
    }

        return await response.json();
    } catch (error) {
        handleApiError(error);
    }
    }

async function getChildGrades(childId) {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GRADES}/${childId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch grades');
        }

        return await response.json();
    } catch (error) {
        handleApiError(error);
    }
    }

async function getChildSchedule(childId) {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SCHEDULE}/${childId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch schedule');
        }

        return await response.json();
    } catch (error) {
        handleApiError(error);
    }
    }
    
async function getFees() {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FEES}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch fees');
    }

        return await response.json();
    } catch (error) {
        handleApiError(error);
    }
    }
    
async function getMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.COMMUNICATIONS}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
    }

        return await response.json();
    } catch (error) {
        handleApiError(error);
    }
    }
    
async function sendMessage(message) {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.COMMUNICATIONS}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
    }

        return await response.json();
    } catch (error) {
        handleApiError(error);
    }
    }
    
async function getParentProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PROFILE}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return await response.json();
    } catch (error) {
        handleApiError(error);
    }
}

// Export all functions
export {
    loginParent,
    getChildren,
    getAnnouncements,
    getChildGrades,
    getChildSchedule,
    getFees,
    getMessages,
    sendMessage,
    getParentProfile,
    getAuthToken,
    removeAuthToken
}; 