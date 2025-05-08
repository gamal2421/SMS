// TeacherAPI class for handling API requests
class TeacherAPI {
    constructor() {
        this.token = localStorage.getItem('token');
        if (!this.token) {
            window.location.href = '/html/login.html';
            return;
        }
        this.baseUrl = 'http://localhost:8000';
        this.setupEventSource();
    }

    setupEventSource() {
        if (typeof EventSource !== "undefined") {
            const eventSource = new EventSource(`${this.baseUrl}/teacher/events?token=${this.token}`);
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealtimeUpdate(data);
            };

            eventSource.onerror = (error) => {
                console.error('EventSource failed:', error);
                eventSource.close();
                setTimeout(() => this.setupEventSource(), 5000); // Retry after 5 seconds
            };
        }
    }

    handleRealtimeUpdate(data) {
        switch(data.type) {
            case 'attendance_update':
                document.dispatchEvent(new CustomEvent('attendanceUpdate', { detail: data }));
                break;
            case 'grade_update':
                document.dispatchEvent(new CustomEvent('gradeUpdate', { detail: data }));
                break;
            case 'assignment_submission':
                document.dispatchEvent(new CustomEvent('assignmentSubmission', { detail: data }));
                break;
            default:
                console.log('Unknown update type:', data.type);
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/html/login.html';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
            return await response.json();
            }
            return await response.text();

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            console.error('API request failed:', error);
            this.showError(error.message);
            throw error;
        }
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Profile endpoints with validation
    async getProfile() {
        return this.request('/auth/me');
    }

    async updateProfile(data) {
        // Validate data before sending
        if (!data.full_name?.trim()) {
            throw new Error('Full name is required');
        }
        if (data.contact && !this.validatePhoneNumber(data.contact)) {
            throw new Error('Invalid contact number format');
        }
        if (data.email && !this.validateEmail(data.email)) {
            throw new Error('Invalid email format');
        }

        return this.request('/teacher/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Validation helpers
    validatePhoneNumber(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Class endpoints with improved error handling
    async getClasses() {
        try {
            const classes = await this.request('/teacher/classes');
            return classes.map(cls => ({
                ...cls,
                studentCount: cls.current_students || 0,
                capacity: cls.capacity || 30,
                schedule: this.formatSchedule(cls.schedule)
            }));
        } catch (error) {
            this.showError('Failed to load classes. Please try again later.');
            return [];
        }
    }

    formatSchedule(schedule) {
        if (!schedule) return 'Not scheduled';
        try {
            const scheduleObj = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
            return Object.entries(scheduleObj)
                .map(([day, time]) => `${day}: ${time}`)
                .join(', ');
        } catch (e) {
            return schedule;
        }
    }

    // Assignment endpoints with validation
    async createAssignment(data) {
        // Validate assignment data
        if (!data.title?.trim()) {
            throw new Error('Assignment title is required');
        }
        if (!data.class_id) {
            throw new Error('Class selection is required');
        }
        if (!data.due_date) {
            throw new Error('Due date is required');
        }
        if (new Date(data.due_date) < new Date()) {
            throw new Error('Due date cannot be in the past');
        }

        const response = await this.request('/teacher/assignments', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        this.showSuccess('Assignment created successfully');
        return response;
    }

    // Attendance endpoints with real-time updates
    async markAttendance(classId, data) {
        if (!Array.isArray(data.attendance)) {
            throw new Error('Invalid attendance data format');
        }

        const response = await this.request(`/teacher/classes/${classId}/attendance`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        this.showSuccess('Attendance marked successfully');
        return response;
    }

    // Grade endpoints with validation
    async createGrade(data) {
        if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) {
            throw new Error('Score must be between 0 and 100');
        }

        const response = await this.request('/teacher/grades', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        this.showSuccess('Grade recorded successfully');
        return response;
    }

    // Dashboard endpoints with caching
    async getDashboardStats() {
        const cacheKey = 'dashboardStats';
        const cachedData = sessionStorage.getItem(cacheKey);
        
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            // Cache for 5 minutes
            if (Date.now() - timestamp < 300000) {
                return data;
            }
        }

        const stats = await this.request('/teacher/dashboard/stats');
        sessionStorage.setItem(cacheKey, JSON.stringify({
            data: stats,
            timestamp: Date.now()
        }));
        
        return stats;
    }

    // Profile endpoints
    async getClassDetails(classId) {
        return this.request(`/teacher/classes/${classId}`);
    }

    async getClassStudents(classId) {
        return this.request(`/teacher/classes/${classId}/students`);
    }

    // Assignment endpoints
    async getAssignments(classId) {
        const endpoint = classId ? `/teacher/classes/${classId}/assignments` : '/teacher/assignments';
        return this.request(endpoint);
    }

    async updateAssignment(assignmentId, data) {
        return this.request(`/teacher/assignments/${assignmentId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteAssignment(assignmentId) {
        return this.request(`/teacher/assignments/${assignmentId}`, {
            method: 'DELETE'
        });
    }

    // Attendance endpoints
    async getAttendance(classId, date) {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        return this.request(`/teacher/classes/${classId}/attendance?${params}`);
    }

    async markAttendance(classId, data) {
        return this.request(`/teacher/classes/${classId}/attendance`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateAttendance(classId, studentId, data) {
        return this.request(`/teacher/classes/${classId}/attendance/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Grade endpoints
    async getGrades(classId, assignmentId = null) {
        const params = new URLSearchParams();
        if (assignmentId) params.append('assignment_id', assignmentId);
        return this.request(`/teacher/classes/${classId}/grades?${params}`);
    }

    async createGrade(data) {
        return this.request('/teacher/grades', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateGrade(gradeId, data) {
        return this.request(`/teacher/grades/${gradeId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Dashboard endpoints
    async getDashboardStats() {
        return this.request('/teacher/dashboard/stats');
    }

    async getRecentActivities() {
        return this.request('/teacher/activities');
    }

    async getAssignment(assignmentId) {
        return this.request(`/teacher/assignments/${assignmentId}`);
    }

    async getAssignmentSubmissions(assignmentId) {
        return this.request(`/teacher/assignments/${assignmentId}/submissions`);
    }
}

// TeacherUI class for handling UI interactions
class TeacherUI {
    constructor() {
        this.api = new TeacherAPI();
        this.currentTab = 'dashboard';
        this.loadingStates = new Set();
        this.initializeEventListeners();
        this.setupRealtimeEvents();
        this.loadInitialData();
    }

    setupRealtimeEvents() {
        document.addEventListener('attendanceUpdate', (e) => this.handleAttendanceUpdate(e.detail));
        document.addEventListener('gradeUpdate', (e) => this.handleGradeUpdate(e.detail));
        document.addEventListener('assignmentSubmission', (e) => this.handleAssignmentSubmission(e.detail));
    }

    handleAttendanceUpdate(data) {
        if (this.currentTab === 'attendance') {
            this.loadAttendance();
        }
        this.showNotification(`Attendance updated for ${data.student_name}`, 'info');
    }

    handleGradeUpdate(data) {
        if (this.currentTab === 'grades') {
            this.loadGrades();
        }
        this.showNotification(`Grade updated for ${data.student_name}`, 'info');
    }

    handleAssignmentSubmission(data) {
        if (this.currentTab === 'assignments') {
            this.loadAssignments();
        }
        this.showNotification(`New submission from ${data.student_name}`, 'info');
    }

    setLoading(elementId, isLoading) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (isLoading) {
            this.loadingStates.add(elementId);
            element.classList.add('loading');
            element.innerHTML = '<div class="loading-spinner"></div>';
        } else {
            this.loadingStates.delete(elementId);
            element.classList.remove('loading');
        }
    }

    initializeEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Class selection change handlers
        const attendanceClassSelect = document.getElementById('attendanceClass');
        const gradesClassSelect = document.getElementById('gradesClass');
        if (attendanceClassSelect) {
            attendanceClassSelect.addEventListener('change', () => this.loadAttendance());
        }
        if (gradesClassSelect) {
            gradesClassSelect.addEventListener('change', () => this.loadAssignmentsForClass());
        }

        // Date selection for attendance
        const attendanceDateInput = document.getElementById('attendanceDate');
        if (attendanceDateInput) {
            attendanceDateInput.valueAsDate = new Date();
            attendanceDateInput.addEventListener('change', () => this.loadAttendance());
        }

        // Assignment selection for grades
        const gradesAssignmentSelect = document.getElementById('gradesAssignment');
        if (gradesAssignmentSelect) {
            gradesAssignmentSelect.addEventListener('change', () => this.loadGrades());
        }

        // Profile edit button
        const editProfileBtn = document.querySelector('.btn-edit-profile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.editProfile());
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Modal close buttons
        document.querySelectorAll('.modal .close-modal, .modal .btn-secondary').forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });

        // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
        });
    });

        // Add grade-specific event listeners
        document.getElementById('gradeClassSelect').addEventListener('change', async () => {
            const classId = document.getElementById('gradeClassSelect').value;
            if (classId) {
                const assignments = await this.api.getAssignments(classId);
                const assignmentSelect = document.getElementById('gradeAssignmentSelect');
                assignmentSelect.innerHTML = '<option value="">Select Assignment</option>';
                assignments.forEach(assignment => {
                    assignmentSelect.innerHTML += `
                        <option value="${assignment.id}">${assignment.title}</option>
                    `;
                });
            }
        });

        document.getElementById('gradeAssignmentSelect').addEventListener('change', () => {
            this.loadGrades();
        });
    }

    async loadInitialData() {
        try {
            this.setLoading('dashboard', true);
            await Promise.all([
                this.loadUserInfo(),
                this.loadDashboard()
            ]);
        this.initializeCurrentTab();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Failed to load initial data', 'error');
        } finally {
            this.setLoading('dashboard', false);
        }
    }

    initializeCurrentTab() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab') || 'dashboard';
        this.switchTab(tab);
    }

    async switchTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // Add active class to selected button
        const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // Load tab-specific data with loading state
        this.setLoading(tabId, true);
        try {
        switch (tabId) {
            case 'dashboard':
                await this.loadDashboard();
            break;
            case 'classes':
                await this.loadClasses();
            break;
            case 'assignments':
                await this.loadAssignments();
            break;
            case 'attendance':
                await this.loadClassList('attendanceClass');
                await this.loadAttendance();
            break;
            case 'grades':
                await this.loadClassList('gradesClass');
            break;
            case 'profile':
                await this.loadProfile();
            break;
            }
        } catch (error) {
            console.error(`Error loading ${tabId} tab:`, error);
            this.showNotification(`Failed to load ${tabId} data`, 'error');
        } finally {
            this.setLoading(tabId, false);
        }

        this.currentTab = tabId;
        history.pushState({}, '', `?tab=${tabId}`);
    }

    async loadUserInfo() {
        try {
            const profile = await this.api.getProfile();
            if (profile) {
                document.getElementById('userInitials').textContent = this.getInitials(profile.full_name);
                document.getElementById('userName').textContent = profile.full_name;
                
                // Update profile section if it exists
                const profileSection = document.getElementById('profileInfo');
                if (profileSection) {
                    profileSection.innerHTML = `
                        <div class="profile-header">
                            <div class="avatar">${this.getInitials(profile.full_name)}</div>
                            <div class="profile-details">
                                <h3>${profile.full_name}</h3>
                                <p>${profile.email}</p>
                            </div>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading user info:', error);
            this.showNotification('Failed to load user information', 'error');
        }
    }

    async loadDashboard() {
        try {
            const stats = await this.api.getDashboardStats();
            if (stats) {
                // Update statistics with animations
                this.animateNumber('totalStudents', stats.total_students);
                this.animateNumber('totalClasses', stats.total_classes);
                this.animateNumber('totalAssignments', stats.active_assignments);
                this.animateNumber('avgAttendance', stats.average_attendance || 0);
            }

            const activities = await this.api.getRecentActivities();
            this.displayRecentActivities(activities);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    animateNumber(elementId, finalValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 1000;
        const steps = 60;
        const stepValue = finalValue / steps;
        let currentStep = 0;
        let currentValue = 0;

        const animate = () => {
            currentStep++;
            currentValue += stepValue;
            element.textContent = Math.round(currentValue);

            if (currentStep < steps) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = finalValue;
            }
        };

        requestAnimationFrame(animate);
    }

    displayRecentActivities(activities) {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-icon">
                    <i class="${this.getActivityIcon(activity.type)}"></i>
            </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-meta">
                        <span class="activity-time">${this.formatDateTime(activity.timestamp)}</span>
                        ${activity.status ? `<span class="activity-status ${activity.status}">${activity.status}</span>` : ''}
                    </div>
                    ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
            </div>
        </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'assignment': 'fas fa-tasks',
            'grade': 'fas fa-star',
            'attendance': 'fas fa-user-check',
            'class': 'fas fa-chalkboard-teacher',
            'default': 'fas fa-bell'
        };
        return icons[type] || icons.default;
    }

    async loadClasses() {
        try {
            const classes = await this.api.getClasses();
            const tableBody = document.getElementById('classesTableBody');
            if (!tableBody) return;

            tableBody.innerHTML = classes.map(classInfo => `
                <tr>
                    <td>${classInfo.name}</td>
                    <td>${classInfo.grade}</td>
                    <td>${classInfo.section}</td>
                    <td>${classInfo.current_students}/${classInfo.capacity}</td>
                    <td>${classInfo.schedule}</td>
                    <td>${classInfo.room}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-view" onclick="teacherUI.viewClass('${classInfo.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-edit" onclick="teacherUI.editClass('${classInfo.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading classes:', error);
            this.showNotification('Failed to load classes', 'error');
        }
    }

    async loadClassList(selectId) {
        try {
            const classes = await this.api.getClasses();
            const select = document.getElementById(selectId);
            if (!select) return;

            select.innerHTML = `
                <option value="">Select Class</option>
                ${classes.map(classInfo => `
                    <option value="${classInfo.id}">${classInfo.name}</option>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading class list:', error);
            this.showNotification('Failed to load class list', 'error');
        }
    }

    async loadAssignments() {
        try {
            const assignments = await this.api.getAssignments();
            const tableBody = document.getElementById('assignmentsTableBody');
            if (!tableBody) return;

            tableBody.innerHTML = assignments.map(assignment => `
                <tr>
                    <td>${assignment.title}</td>
                    <td>${assignment.class_name}</td>
                    <td>${this.formatDate(assignment.due_date)}</td>
                    <td>
                        <span class="status-badge status-${assignment.status.toLowerCase()}">
                            ${assignment.status}
                        </span>
                    </td>
                    <td>${assignment.submissions_count}/${assignment.total_students}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-view" onclick="teacherUI.viewAssignment('${assignment.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-edit" onclick="teacherUI.editAssignment('${assignment.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-delete" onclick="teacherUI.deleteAssignment('${assignment.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading assignments:', error);
            this.showNotification('Failed to load assignments', 'error');
        }
    }

    async loadAttendance() {
        const classId = document.getElementById('attendanceClass').value;
        const date = document.getElementById('attendanceDate').value;
        
        if (!classId || !date) return;

        try {
            const attendance = await this.api.getAttendance(classId, date);
            const tableBody = document.getElementById('attendanceTableBody');
            if (!tableBody) return;

            tableBody.innerHTML = attendance.map(record => `
                <tr>
                    <td>${record.student_name}</td>
                    <td>
                        <select class="status-select" onchange="teacherUI.updateAttendance('${record.id}', this.value)">
                            <option value="present" ${record.status === 'present' ? 'selected' : ''}>Present</option>
                            <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>Absent</option>
                            <option value="late" ${record.status === 'late' ? 'selected' : ''}>Late</option>
                    </select>
                </td>
                <td>
                        <input type="text" class="notes-input" 
                               value="${record.notes || ''}"
                               onchange="teacherUI.updateAttendance('${record.id}', undefined, this.value)">
                </td>
            </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading attendance:', error);
            this.showNotification('Failed to load attendance records', 'error');
        }
    }

    async loadAssignmentsForClass() {
        const classId = document.getElementById('gradesClass').value;
        if (!classId) return;

        try {
            const assignments = await this.api.getAssignments(classId);
            const select = document.getElementById('gradesAssignment');
            if (!select) return;

            select.innerHTML = `
                <option value="">Select Assignment</option>
                ${assignments.map(assignment => `
                    <option value="${assignment.id}">${assignment.title}</option>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading assignments for class:', error);
            this.showNotification('Failed to load assignments', 'error');
        }
    }

    async loadGrades() {
        const classId = document.getElementById('gradeClassSelect').value;
        const assignmentId = document.getElementById('gradeAssignmentSelect').value;
        
        if (!classId || !assignmentId) {
            return;
        }

        try {
            const submissions = await this.api.getAssignmentSubmissions(assignmentId);
            const gradesTableBody = document.getElementById('gradesTableBody');
            gradesTableBody.innerHTML = '';

            submissions.forEach(submission => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${submission.student_name}</td>
                    <td>
                        <input type="number" 
                               class="grade-input" 
                               value="${submission.grade || ''}" 
                               min="0" 
                               max="100" 
                               data-submission-id="${submission.id}"
                               ${submission.grade ? 'readonly' : ''}
                        >
                    </td>
                    <td>
                        <span class="status-badge ${submission.status.toLowerCase()}">
                            ${submission.status}
                        </span>
                    </td>
                    <td>${this.formatDateTime(submission.submission_date)}</td>
                    <td>
                        ${submission.grade ? 
                            `<button class="btn btn-secondary btn-sm" disabled>Graded</button>` :
                            `<button class="btn btn-primary btn-sm" onclick="window.teacherUI.saveGrade(${submission.id})">
                                Save Grade
                            </button>`
                        }
                    </td>
                `;
                gradesTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading grades:', error);
            this.showNotification('Failed to load grades', 'error');
        }
    }

    async saveGrade(submissionId) {
        const input = document.querySelector(`input[data-submission-id="${submissionId}"]`);
        const grade = parseFloat(input.value);

        if (isNaN(grade) || grade < 0 || grade > 100) {
            this.showNotification('Please enter a valid grade between 0 and 100', 'error');
            return;
        }

        try {
            await this.api.createGrade({
                submission_id: submissionId,
                score: grade
            });

            // Update UI
            input.readOnly = true;
            const saveButton = input.parentElement.parentElement.querySelector('button');
            saveButton.className = 'btn btn-secondary btn-sm';
            saveButton.disabled = true;
            saveButton.textContent = 'Graded';

            this.showNotification('Grade saved successfully', 'success');
        } catch (error) {
            console.error('Error saving grade:', error);
            this.showNotification('Failed to save grade', 'error');
        }
    }

    async loadProfile() {
        try {
            const profile = await this.api.getProfile();
            if (profile) {
                document.getElementById('profileInitials').textContent = this.getInitials(profile.full_name);
                document.getElementById('profileName').textContent = profile.full_name;
                document.getElementById('profileEmail').textContent = profile.email;
                document.getElementById('profileSubject').textContent = profile.subject;
                document.getElementById('profileContact').textContent = profile.contact || 'Not set';
                document.getElementById('profileQualification').textContent = profile.qualification || 'Not set';
                document.getElementById('profileBio').textContent = profile.bio || 'No bio available';
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showNotification('Failed to load profile', 'error');
        }
    }

    // Action handlers
    async createAssignment() {
        const modal = document.getElementById('createAssignmentModal');
        if (modal) {
            modal.style.display = 'block';
            await this.loadClassList('assignmentClass');
        }
    }

    async saveAssignment() {
        const data = {
            title: document.getElementById('assignmentTitle').value,
            description: document.getElementById('assignmentDescription').value,
            class_id: document.getElementById('assignmentClass').value,
            due_date: document.getElementById('assignmentDueDate').value,
            max_score: parseFloat(document.getElementById('assignmentMaxScore').value)
        };

        try {
            await this.api.createAssignment(data);
            this.showNotification('Assignment created successfully', 'success');
            this.closeModal();
            await this.loadAssignments();
        } catch (error) {
            console.error('Error creating assignment:', error);
            this.showNotification('Failed to create assignment', 'error');
        }
    }

    async viewClass(classId) {
        try {
            const classDetails = await this.api.getClassDetails(classId);
            const modal = document.getElementById('viewClassModal');
            if (modal && classDetails) {
                modal.style.display = 'block';
                // Populate modal with class details
                const content = modal.querySelector('.modal-content');
                content.innerHTML = `
                    <h2>${classDetails.name}</h2>
                    <p><strong>Grade:</strong> ${classDetails.grade}</p>
                    <p><strong>Section:</strong> ${classDetails.section}</p>
                    <p><strong>Students:</strong> ${classDetails.current_students}/${classDetails.capacity}</p>
                    <p><strong>Schedule:</strong> ${classDetails.schedule}</p>
                    <p><strong>Room:</strong> ${classDetails.room}</p>
                `;
            }
        } catch (error) {
            console.error('Error loading class details:', error);
            this.showNotification('Failed to load class details', 'error');
        }
    }

    async editClass(classId) {
        try {
            const classDetails = await this.api.getClassDetails(classId);
            const modal = document.getElementById('editClassModal');
            if (modal && classDetails) {
                modal.style.display = 'block';
                // Populate form with class details
                document.getElementById('editClassName').value = classDetails.name;
                document.getElementById('editClassGrade').value = classDetails.grade;
                document.getElementById('editClassSection').value = classDetails.section;
                document.getElementById('editClassSchedule').value = classDetails.schedule;
                document.getElementById('editClassRoom').value = classDetails.room;
            }
        } catch (error) {
            console.error('Error loading class details:', error);
            this.showNotification('Failed to load class details', 'error');
        }
    }

    async viewAssignment(assignmentId) {
        try {
            const assignment = await this.api.getAssignment(assignmentId);
            const submissions = await this.api.getAssignmentSubmissions(assignmentId);
            const modal = document.getElementById('viewAssignmentModal');
            
            if (!modal) return;
            
            // Update modal fields
            modal.querySelector('#viewAssignmentTitle').textContent = assignment.title || '';
            modal.querySelector('#viewAssignmentClass').textContent = assignment.class_name || '';
            modal.querySelector('#viewAssignmentDueDate').textContent = assignment.due_date ? this.formatDate(assignment.due_date) : '';
            modal.querySelector('#viewAssignmentStatus').textContent = assignment.status || '';
            modal.querySelector('#viewAssignmentDescription').textContent = assignment.description || '';
            modal.querySelector('#viewAssignmentSubmissions').textContent = `${submissions.length} submission(s)`;
            
            // Update submissions list
            const submissionsList = modal.querySelector('#viewAssignmentSubmissionsList');
            if (submissions && submissions.length > 0) {
                submissionsList.innerHTML = submissions.map(sub => `
                    <div class="submission-item">
                        <div class="submission-header">
                            <span class="student-name">${sub.student_name}</span>
                            <span class="submission-date">${this.formatDate(sub.submission_date)}</span>
                        </div>
                        <div class="submission-status">
                            <span class="status-badge status-${sub.status.toLowerCase()}">${sub.status}</span>
                        </div>
                        ${sub.file_path ? `
                            <div class="submission-file">
                                <a href="/uploads/assignments/${sub.file_path}" target="_blank">
                                    <i class="fas fa-file"></i> View Submission
                                </a>
                            </div>
                        ` : '<p class="no-file">No file submitted</p>'}
                    </div>
                `).join('');
            } else {
                submissionsList.innerHTML = '<p class="no-submissions">No submissions yet</p>';
            }

            // Store assignment ID for edit button
            modal.dataset.assignmentId = assignmentId;

            // Show the modal
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('Error viewing assignment:', error);
            this.showNotification('Failed to load assignment details', 'error');
        }
    }

    async editAssignment(assignmentId) {
        try {
            const assignment = await this.api.getAssignments(null);
            const modal = document.getElementById('editAssignmentModal');
            if (modal && assignment) {
                modal.style.display = 'block';
                // Populate form with assignment details
                document.getElementById('editAssignmentTitle').value = assignment.title;
                document.getElementById('editAssignmentDescription').value = assignment.description;
                document.getElementById('editAssignmentDueDate').value = assignment.due_date;
                document.getElementById('editAssignmentMaxScore').value = assignment.max_score;
            }
        } catch (error) {
            console.error('Error loading assignment details:', error);
            this.showNotification('Failed to load assignment details', 'error');
        }
    }

    async deleteAssignment(assignmentId) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            try {
                await this.api.deleteAssignment(assignmentId);
                this.showNotification('Assignment deleted successfully', 'success');
                await this.loadAssignments();
            } catch (error) {
                console.error('Error deleting assignment:', error);
                this.showNotification('Failed to delete assignment', 'error');
            }
        }
    }

    async updateAttendance(attendanceId, status, notes) {
        try {
            const data = {};
            if (status !== undefined) data.status = status;
            if (notes !== undefined) data.notes = notes;
            
            await this.api.updateAttendance(attendanceId, data);
            this.showNotification('Attendance updated successfully', 'success');
        } catch (error) {
            console.error('Error updating attendance:', error);
            this.showNotification('Failed to update attendance', 'error');
        }
    }

    async updateGrade(gradeId, score) {
        try {
            await this.api.updateGrade(gradeId, { score: parseFloat(score) });
            this.showNotification('Grade updated successfully', 'success');
        } catch (error) {
            console.error('Error updating grade:', error);
            this.showNotification('Failed to update grade', 'error');
        }
    }

    async viewSubmission(gradeId) {
        try {
            const submission = await this.api.getGrades(null);
            const modal = document.getElementById('viewSubmissionModal');
            if (modal && submission) {
                modal.style.display = 'block';
                // Populate modal with submission details
                const content = modal.querySelector('.modal-content');
                content.innerHTML = `
                    <h2>Submission Details</h2>
                    <p><strong>Student:</strong> ${submission.student_name}</p>
                    <p><strong>Submitted:</strong> ${this.formatDateTime(submission.submission_date)}</p>
                    <p><strong>Score:</strong> ${submission.score || 'Not graded'}</p>
                    <p><strong>Comments:</strong> ${submission.comments || 'No comments'}</p>
                `;
            }
        } catch (error) {
            console.error('Error loading submission:', error);
            this.showNotification('Failed to load submission', 'error');
        }
    }

    async editProfile() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.style.display = 'block';
            const profile = await this.api.getProfile();
            if (profile) {
                document.getElementById('editFullName').value = profile.full_name;
                document.getElementById('editContact').value = profile.contact || '';
                document.getElementById('editQualification').value = profile.qualification || '';
                document.getElementById('editBio').value = profile.bio || '';
            }
        }
    }

    async saveProfile() {
        const data = {
            full_name: document.getElementById('editFullName').value,
            contact: document.getElementById('editContact').value,
            qualification: document.getElementById('editQualification').value,
            bio: document.getElementById('editBio').value
        };

        const password = document.getElementById('editPassword').value;
        if (password) {
            data.password = password;
        }

        try {
            await this.api.updateProfile(data);
            this.showNotification('Profile updated successfully', 'success');
            this.closeModal();
            await this.loadProfile();
            await this.loadUserInfo();
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Failed to update profile', 'error');
        }
    }

    // Utility functions
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
        </div>
    `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || icons.info;
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        });
    }

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/html/login.html';
    }

    resetGradeStats() {
        const elements = ['averageGrade', 'submittedCount', 'pendingCount', 'highestGrade'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '-';
            }
        });
        
        const gradesTableBody = document.getElementById('gradesTableBody');
        if (gradesTableBody) {
            gradesTableBody.innerHTML = '';
        }
    }
}

// Initialize the UI
window.teacherUI = new TeacherUI();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    window.teacherUI.init();
});

// Function to setup Server-Sent Events for real-time notifications
function setupNotifications() {
    const teacherId = localStorage.getItem('userId');
    if (!teacherId) return;
    
    const eventSource = new EventSource(`/school_api/teacher/${teacherId}/notifications`);
    
    eventSource.onmessage = function(event) {
        const notification = JSON.parse(event.data);
        showNotification(notification.title, notification.message);
    };
    
    eventSource.onerror = function() {
        console.error('SSE connection error');
        eventSource.close();
        // Try to reconnect after 5 seconds
        setTimeout(setupNotifications, 5000);
    };
}

// Function to display notifications
function showNotification(title, message) {
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    notificationElement.innerHTML = `
        <div class="notification-header">
            <h3>${title}</h3>
            <span class="close-notification">&times;</span>
        </div>
        <p>${message}</p>
    `;
    
    document.body.appendChild(notificationElement);
    
    // Make notification visible with animation
    setTimeout(() => {
        notificationElement.classList.add('visible');
    }, 10);
    
    // Add event listener to close button
    notificationElement.querySelector('.close-notification').addEventListener('click', function() {
        notificationElement.classList.remove('visible');
        setTimeout(() => {
            notificationElement.remove();
        }, 300);
    });
    
    // Automatically hide notification after 5 seconds
    setTimeout(() => {
        notificationElement.classList.remove('visible');
        setTimeout(() => {
            notificationElement.remove();
        }, 300);
    }, 5000);
}

// Handle modal dialogs
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Close modal when clicking outside of modal content
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
});

// Generic error handler
function handleError(error) {
    console.error('Error:', error);
    showNotification('Error', error.message || 'An unexpected error occurred');
}

// Date formatting helper
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time helper
function formatTime(timeString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options);
} 