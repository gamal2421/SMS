class TeacherAPI {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
        this.token = localStorage.getItem('token');
        
        // Check if we're not on the login page and there's no token
        if (!window.location.pathname.includes('login.html') && !this.token) {
            window.location.href = './login.html';
            return;
        }
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            };

            const config = {
                method,
                headers,
                mode: 'cors',
                credentials: 'omit'
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.body = JSON.stringify(data);
            }

            console.log('Making API request to', endpoint);
            console.log('Request headers:', headers);

            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            console.log('Response status:', response.status);

            if (response.status === 401 || response.status === 403) {
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

    // User endpoints
    async getCurrentUser() {
        return this.makeRequest('/auth/me');
    }

    async updateProfile(data) {
        return this.makeRequest('/teacher/profile', 'PUT', data);
    }

    // Dashboard endpoints
    async getDashboardStats() {
        return this.makeRequest('/teacher/dashboard/stats');
    }

    async getRecentActivities() {
        return this.makeRequest('/teacher/activities');
    }

    // Class endpoints
    async getClasses() {
        return this.makeRequest('/teacher/classes');
    }

    async getClass(classId) {
        return this.makeRequest(`/teacher/classes/${classId}`);
    }

    async getClassStudents(classId) {
        return this.makeRequest(`/teacher/classes/${classId}/students`);
    }

    // Assignment endpoints
    async getAssignments() {
        try {
            const data = await this.makeRequest('/teacher/assignments');
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching assignments:', error);
            return []; // Return an empty array on error instead of throwing
        }
    }

    async getAssignment(assignmentId) {
        try {
            return await this.makeRequest(`/teacher/assignments/${assignmentId}`);
        } catch (error) {
            console.error(`Error fetching assignment ${assignmentId}:`, error);
            throw new Error(`Failed to fetch assignment details: ${error.message}`);
        }
    }

    async getClassAssignments(classId) {
        return this.makeRequest(`/teacher/classes/${classId}/assignments`);
    }

    async getAssignmentSubmissions(assignmentId) {
        return this.makeRequest(`/teacher/assignments/${assignmentId}/submissions`);
    }

    async createAssignment(data) {
        return this.makeRequest('/teacher/assignments', 'POST', data);
    }

    async updateAssignment(assignmentId, data) {
        return this.makeRequest(`/teacher/assignments/${assignmentId}`, 'PUT', data);
    }

    async deleteAssignment(assignmentId) {
        return this.makeRequest(`/teacher/assignments/${assignmentId}`, 'DELETE');
    }

    // Grade endpoints
    async getGrades(classId, assignmentId) {
        return this.makeRequest(`/teacher/classes/${classId}/grades?assignment_id=${assignmentId}`);
    }

    async updateGrade(classId, assignmentId, studentId, score, comment = null) {
        const data = {
            student_id: studentId,
            class_id: classId,
            assignment_id: assignmentId,
            score: score,
            grade_type: "assignment",
            weight: 1.0,
            status: "graded"
        };

        if (comment !== null) {
            data.comment = comment;
        }

        return this.makeRequest(`/teacher/classes/${classId}/grades`, 'POST', data);
    }

    async addGradeComment(classId, assignmentId, studentId, comment) {
        return this.makeRequest(`/teacher/classes/${classId}/grades/comment`, {
            method: 'POST',
            body: JSON.stringify({
                assignment_id: assignmentId,
                student_id: studentId,
                comment: comment
            })
        });
    }

    async getClassGrades(classId) {
        return this.makeRequest(`/teacher/classes/${classId}/grades`);
    }

    async getStudent(studentId) {
        return this.makeRequest(`/teacher/students/${studentId}`);
    }

    // Attendance endpoints
    async getAttendance(classId, date) {
        return this.makeRequest(`/teacher/classes/${classId}/attendance?date=${date}`);
    }

    async updateAttendance(attendanceId, data) {
        return this.makeRequest(`/teacher/attendance/${attendanceId}`, 'PUT', data);
    }

    async getStudentAttendanceHistory(classId, studentId) {
        return this.makeRequest(`/teacher/classes/${classId}/students/${studentId}/attendance`);
    }

    // Class Enrollments
    async getClassEnrollments(classId) {
        return this.makeRequest(`/teacher/classes/${classId}/enrollments`);
    }

    async enrollStudents(classId, studentIds) {
        return this.makeRequest(`/admin/classes/${classId}/enrollments`, 'POST', { studentIds });
    }

    async removeStudentFromClass(classId, studentId) {
        return this.makeRequest(`/admin/classes/${classId}/enrollments/${studentId}`, 'DELETE');
    }

    async getSubmission(submissionId) {
        return this.makeRequest(`/teacher/submissions/${submissionId}`);
    }

    async updateSubmission(submissionId, data) {
        return this.makeRequest(`/teacher/submissions/${submissionId}`, 'PUT', data);
    }

    getFileDownloadUrl(filePath) {
        // Ensure the file path is properly encoded while preserving the directory structure
        return `${this.baseUrl}/teacher/assignments/submissions/${encodeURIComponent(filePath)}`;
    }

    async getClassStats(classId) {
        return this.makeRequest(`/teacher/classes/${classId}/stats`);
    }
}