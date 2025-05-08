class StudentAPI {
    constructor() {
        this.baseUrl = 'http://localhost:8000'; // Updated to use direct URL
        this.token = localStorage.getItem('token');
        
        // Check if we're not on the login page and there's no token
        if (!window.location.pathname.includes('login.html') && !this.token) {
            window.location.href = './login.html';
            return;
        }
    }
    
    async makeRequest(endpoint, method = 'GET', data = null, isFormData = false) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            };
            
            const config = {
                method,
                headers,
                mode: 'cors',
                credentials: 'include' // Changed from 'omit' to 'include'
            };
            
            if (data) {
                if (isFormData) {
                    // For FormData, don't set Content-Type header
                    delete config.headers['Content-Type'];
                    config.body = data;
                } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
                    config.body = JSON.stringify(data);
                }
            }
            
            console.log('Making API request to', endpoint);
            console.log('Request headers:', headers);
            
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            console.log('Response status:', response.status);
            
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = './login.html';
                throw new Error('Unauthorized');
            }
            
            if (!response.ok) {
                throw new Error(`Failed to ${method.toLowerCase()} ${endpoint}`);
            }
            
            const responseData = await response.json();
            console.log('Response data:', responseData);
            return responseData;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
    
    // Get student profile
    async getProfile() {
        return this.makeRequest('/student/profile');
    }
    
    // Student Profile
    async getStudentProfile(studentId) {
        return this.makeRequest(`/student/${studentId}`);
    }
    
    async updateStudentProfile(studentId, profileData) {
        return this.makeRequest(`/student/${studentId}`, 'PUT', profileData);
    }
    
    // Dashboard
    async getDashboardData() {
        return this.makeRequest('/student/dashboard');
    }
    
    // Schedule
    async getSchedule() {
        return this.makeRequest('/student/schedule');
    }
    
    // Assignments
    async getAssignments(status = null) {
        let endpoint = '/student/assignments';
        if (status) {
            endpoint += `?status=${status}`;
        }
        return this.makeRequest(endpoint);
    }
    
    async getAssignmentDetails(assignmentId) {
        return this.makeRequest(`/student/assignment/${assignmentId}`);
    }
    
    async submitAssignment(assignmentId, formData) {
        return this.makeRequest(`/student/assignments/${assignmentId}/submit`, 'POST', formData, true);
    }
    
    // Submissions
    async getSubmissionDetails(assignmentId) {
        return this.makeRequest(`/student/submission/${assignmentId}`);
    }
    
    // Grades
    async getGrades() {
        return this.makeRequest('/student/grades');
    }
    
    async getClassGrades(classId) {
        return this.makeRequest(`/student/grades/${classId}`);
    }
    
    // Attendance
    async getAttendance() {
        return this.makeRequest('/student/attendance');
    }
    
    async getAttendanceByMonth(month, year) {
        return this.makeRequest(`/student/attendance/${year}/${month}`);
    }
    
    // Notifications
    async getNotifications() {
        return this.makeRequest('/student/notifications');
    }
    
    async markNotificationAsRead(notificationId) {
        return this.makeRequest(`/student/notification/${notificationId}/read`, 'POST');
    }
    
    // Certificates and Reports
    async getStudentCertificates() {
        return this.makeRequest('/student/certificates');
    }
    
    async requestTranscript() {
        return this.makeRequest('/student/transcript/request', 'POST');
    }
    
    // Feedback
    async submitFeedback(feedbackData) {
        return this.makeRequest('/student/feedback', 'POST', feedbackData);
    }
} 