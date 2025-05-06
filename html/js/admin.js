// API Communication Layer
class AdminAPI {
    constructor() {
        // Use window.location.origin to dynamically set the API URL
        this.baseUrl = 'http://localhost:8000';
        this.token = localStorage.getItem('token');
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        
        // Check if we're not on the login page and there's no token
        if (!window.location.pathname.includes('login.html') && !this.token) {
            window.location.href = './login.html';
            return;
        }
    }

    async request(endpoint, options = {}, retryCount = 0) {
        try {
            // Get the latest token
            this.token = localStorage.getItem('token');
            
            if (!this.token && !endpoint.includes('/auth/')) {
                throw new Error('Authentication required');
            }

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            };

            // Add retry mechanism
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    ...options,
                    headers,
                    mode: 'cors'
                });

                // Handle HTTP errors
                if (!response.ok) {
                    let errorMessage;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.detail || errorData.message || 'An error occurred';
                    } catch {
                        errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
                    }

                    // Handle specific status codes
                    switch (response.status) {
                        case 401:
                            localStorage.removeItem('token');
                            localStorage.removeItem('userRole');
                            window.location.href = './login.html';
                            throw new Error('Authentication failed');
                        case 403:
                            throw new Error('Access denied');
                        case 404:
                            throw new Error('Resource not found');
                        case 422:
                            throw new Error('Invalid data provided: ' + errorMessage);
                        case 500:
                            throw new Error('Server error. Please try again later.');
                        case 503:
                            throw new Error('Service temporarily unavailable');
                        default:
                            throw new Error(errorMessage);
                    }
                }

                // Parse response
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }
                return await response.text();

            } catch (fetchError) {
                // Network errors or server unreachable
                if ((fetchError.name === 'TypeError' && fetchError.message === 'Failed to fetch') || 
                    fetchError.message.includes('Network') || 
                    fetchError.message.includes('network') ||
                    fetchError.message.includes('NETWORK_CHANGED')) {
                    
                    console.log(`Network error: retrying request (${retryCount + 1}/${this.maxRetries})...`);
                    
                    // Show a notification on first try
                    if (retryCount === 0 && window.AdminUI && window.AdminUI.showNotification) {
                        window.AdminUI.showNotification(
                            'Network connection issue. Trying to reconnect...', 
                            'warning'
                        );
                    }
                    
                    if (retryCount < this.maxRetries) {
                        // Wait longer between each retry
                        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
                        return this.request(endpoint, options, retryCount + 1);
                    } else {
                        throw new Error('Network connection failed. Please check your internet connection and try again.');
                    }
                }
                throw fetchError;
            }

        } catch (error) {
            console.error('API Request Error:', error);
            this.handleApiError(error);
            throw error;
        }
    }

    // Error Handler with improved error messages
    handleApiError(error) {
        console.error('API Error:', error);

        let message = 'An unexpected error occurred';
        let shouldRedirect = false;
        
        if (error.message.includes('Failed to fetch') || error.message.includes('Network connection failed')) {
            message = 'Unable to connect to the server. Please check your internet connection and server status.';
        } else if (error.message.includes('NetworkError') || error.message.includes('network')) {
            message = 'Network error occurred. Please check your internet connection and try again.';
        } else if (error.message.includes('Timeout')) {
            message = 'Request timed out. The server is taking too long to respond.';
        } else if (error.message.includes('Authentication failed')) {
            message = 'Your session has expired. Please log in again.';
            shouldRedirect = true;
        } else if (error.message.includes('Access denied')) {
            message = 'You do not have permission to perform this action. Please contact an administrator.';
        } else if (error.message.includes('Resource not found')) {
            message = 'The requested information could not be found. It may have been deleted or moved.';
        } else if (error.message.includes('Invalid data')) {
            message = 'The information provided is invalid. Please check your input and try again.';
        } else if (error.message.includes('Email already registered') || error.message.includes('duplicate key')) {
            message = 'This email address is already registered in the system.';
        } else if (error.message.includes('Server error')) {
            message = 'The server encountered an error. Our team has been notified and is working on it.';
        } else {
            message = error.message;
        }

        if (window.AdminUI && window.AdminUI.showNotification) {
            window.AdminUI.showNotification(message, 'error');
        }

        if (shouldRedirect) {
            this.logout();
        }

        throw error;
    }

    // Authentication endpoints
    async login(credentials) {
        return await this.request('/auth/token', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = './login.html';
    }

    // Dashboard endpoints
    async getStats() {
        return await this.request('/admin/stats');
    }

    // Student Management
    async getStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/admin/students${queryString ? `?${queryString}` : ''}`);
    }

    async getStudent(id) {
        return await this.request(`/admin/students/${id}`);
    }

    async createStudent(data) {
        try {
            const validatedData = this.validateStudentData(data);
            return await this.request('/admin/students', {
                method: 'POST',
                body: JSON.stringify(validatedData)
            });
        } catch (error) {
            console.error('API Error - Create Student:', error);
            throw error;
        }
    }

    async updateStudent(id, data) {
        return await this.request(`/admin/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify(this.validateStudentData(data))
        });
    }

    async deleteStudent(id) {
        return await this.request(`/admin/students/${id}`, {
            method: 'DELETE'
        });
    }

    // Teacher Management
    async getTeachers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/admin/teachers${queryString ? `?${queryString}` : ''}`);
    }

    async getTeacher(id) {
        return await this.request(`/admin/teachers/${id}`);
    }

    async createTeacher(data) {
        return await this.request('/admin/teachers', {
            method: 'POST',
            body: JSON.stringify(this.validateTeacherData(data))
        });
    }

    async updateTeacher(id, data) {
        return await this.request(`/admin/teachers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(this.validateTeacherData(data))
        });
    }

    async deleteTeacher(id) {
        return await this.request(`/admin/teachers/${id}`, {
            method: 'DELETE'
        });
    }

    // Parent Management
    async getParents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/admin/parents${queryString ? `?${queryString}` : ''}`);
    }

    async getParent(id) {
        return await this.request(`/admin/parents/${id}`);
    }

    async createParent(data) {
        try {
            return await this.request('/admin/parents', {
                method: 'POST',
                body: JSON.stringify(this.validateParentData(data))
            });
        } catch (error) {
            console.error('API Error - Create Parent:', error);
            throw error;
        }
    }

    async updateParent(id, data) {
        return await this.request(`/admin/parents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(this.validateParentData(data))
        });
    }

    async deleteParent(id) {
        return await this.request(`/admin/parents/${id}`, {
            method: 'DELETE'
        });
    }

    // Parent-Student Relationship Management
    async getParentStudents(parentId) {
        try {
            const result = await this.request(`/admin/parents/${parentId}/students`);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error(`API Error when fetching students for parent ${parentId}:`, error);
            // Return empty array instead of propagating error
            return [];
        }
    }

    async linkParentStudent(parentId, studentId) {
        try {
            return await this.request(`/admin/parents/${parentId}/students/${studentId}`, {
                method: 'POST'
            });
        } catch (error) {
            console.error(`API Error - Linking student ${studentId} to parent ${parentId}:`, error);
            throw error;
        }
    }

    async unlinkParentStudent(parentId, studentId) {
        try {
            return await this.request(`/admin/parents/${parentId}/students/${studentId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error(`API Error - Unlinking student ${studentId} from parent ${parentId}:`, error);
            throw error;
        }
    }

    // Class Management
    async getClasses(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/admin/classes${queryString ? `?${queryString}` : ''}`);
    }

    async getClass(id) {
        return await this.request(`/admin/classes/${id}`);
    }

    async createClass(data) {
        return await this.request('/admin/classes', {
            method: 'POST',
            body: JSON.stringify(this.validateClassData(data))
        });
    }

    async updateClass(id, data) {
        return await this.request(`/admin/classes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(this.validateClassData(data))
        });
    }

    async deleteClass(id) {
        return await this.request(`/admin/classes/${id}`, {
            method: 'DELETE'
        });
    }

    // Data Validation Methods
    validateStudentData(data) {
        const requiredFields = ['full_name', 'email'];
        this.validateRequiredFields(data, requiredFields);
        
        // Clean up data object to make sure we're sending valid data to the API
        const cleanData = {
            ...data,
            role: 'student'
        };
        
        // Convert empty string values to null for backend validation
        for (const key in cleanData) {
            if (cleanData[key] === '') {
                cleanData[key] = null;
            }
        }
        
        // Ensure all fields that could be null are properly represented
        if (!cleanData.grade) cleanData.grade = null;
        if (!cleanData.section) cleanData.section = null;
        if (!cleanData.contact) cleanData.contact = null;
        
        return cleanData;
    }

    validateTeacherData(data) {
        const requiredFields = ['full_name', 'email'];
        this.validateRequiredFields(data, requiredFields);
        
        // Clean up data object to make sure we're sending valid data to the API
        const cleanData = {
            ...data,
            role: 'teacher'
        };
        
        // Convert empty string values to null for backend validation
        for (const key in cleanData) {
            if (cleanData[key] === '') {
                cleanData[key] = null;
            }
        }
        
        // Ensure all fields that could be null are properly represented
        if (!cleanData.subject) cleanData.subject = null;
        if (!cleanData.contact) cleanData.contact = null;
        
        return cleanData;
    }

    validateParentData(data) {
        const requiredFields = ['full_name', 'email'];
        this.validateRequiredFields(data, requiredFields);
        
        // Clean up data object to make sure we're sending valid data to the API
        const cleanData = {
            ...data,
            role: 'parent'
        };
        
        // Convert empty string values to null for backend validation
        for (const key in cleanData) {
            if (cleanData[key] === '') {
                cleanData[key] = null;
            }
        }
        
        // Ensure contact field that could be null is properly represented
        if (!cleanData.contact) cleanData.contact = null;
        
        return cleanData;
    }

    validateClassData(data) {
        const requiredFields = ['name', 'grade', 'section'];
        this.validateRequiredFields(data, requiredFields);
        
        return data;
    }

    validateRequiredFields(data, requiredFields) {
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
    }
}

// UI Management
class AdminUI {
    static api = new AdminAPI();

    static async init() {
        try {
            // Check if we have a token
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found, redirecting to login');
                window.location.href = './login.html';
                return;
            }

            // Verify admin role
            const userRole = localStorage.getItem('userRole');
            if (userRole !== 'admin') {
                console.error('Non-admin user attempting to access admin page');
                window.location.href = './login.html';
                return;
            }

            // Get current user info
            const userData = await this.api.getCurrentUser();
            if (!userData || userData.role !== 'admin') {
                console.error('Invalid user data or non-admin user');
                window.location.href = './login.html';
                return;
            }

            // Update user info display
            this.updateUserInfo(userData);
            
            // Load admin dashboard data
            await this.loadDashboard();
            
            // Setup event listeners
            this.setupEventListeners();
            this.setupModalEventListeners();

            // Load initial data for the active tab
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                await this.loadTabContent(activeTab.getAttribute('data-tab'));
            }

        } catch (error) {
            console.error('Error during initialization:', error);
            if (error.message.includes('401') || error.message.includes('403')) {
                window.location.href = './login.html';
            } else {
                this.showNotification('Error initializing the dashboard', 'error');
            }
        }
    }

    static updateUserInfo(userData) {
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (userAvatar) {
            userAvatar.textContent = userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        if (userName) {
            userName.textContent = userData.full_name;
        }
    }

    static async loadDashboard() {
        try {
            const stats = await this.api.getStats();
            
            // Update dashboard statistics
            const elements = {
                totalStudents: stats.students || 0,
                totalTeachers: stats.teachers || 0,
                totalParents: stats.parents || 0,
                totalClasses: stats.classes || 0
            };

            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    }

    static setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const tabId = e.target.getAttribute('data-tab');
                if (tabId) {
                    await this.openTab(tabId);
                }
            });
        });
    }

    static async openTab(tabId) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Deactivate all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content and activate button
        const selectedTab = document.getElementById(tabId);
        const selectedBtn = document.querySelector(`[data-tab="${tabId}"]`);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // Load tab content
        await this.loadTabContent(tabId);
    }

    static async loadTabContent(tabId) {
        try {
            switch (tabId) {
                case 'students':
                    await this.loadStudents();
                    break;
                case 'teachers':
                    await this.loadTeachers();
                    break;
                case 'parents':
                    await this.loadParents();
                    break;
                case 'classes':
                    await this.loadClasses();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${tabId} content:`, error);
            this.showNotification(`Error loading ${tabId}. Please try again.`, 'error');
        }
    }

    static async loadStudents() {
        try {
            const students = await this.api.getStudents();
            const tbody = document.getElementById('studentsTableBody');
            if (!tbody) return;

            tbody.innerHTML = students.map(student => `
                <tr>
                    <td>${student.full_name}</td>
                    <td>${student.email}</td>
                    <td>${student.grade || '-'}</td>
                    <td>${student.section || '-'}</td>
                    <td>${student.contact || '-'}</td>
                    <td>
                        <button onclick="AdminUI.editStudent(${student.id})" class="btn btn-secondary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="AdminUI.deleteStudent(${student.id})" class="btn btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading students:', error);
            this.showNotification('Error loading students', 'error');
        }
    }

    static async loadTeachers() {
        try {
            const teachers = await this.api.getTeachers();
            const tbody = document.getElementById('teachersTableBody');
            if (!tbody) return;

            tbody.innerHTML = teachers.map(teacher => `
                <tr>
                    <td>${teacher.full_name}</td>
                    <td>${teacher.email}</td>
                    <td>${teacher.subject || '-'}</td>
                    <td>${teacher.contact || '-'}</td>
                    <td>
                        <button onclick="AdminUI.editTeacher(${teacher.id})" class="btn btn-secondary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="AdminUI.deleteTeacher(${teacher.id})" class="btn btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading teachers:', error);
            this.showNotification('Error loading teachers', 'error');
        }
    }

    static async loadParents() {
        try {
            const parents = await this.api.getParents();
            const tbody = document.getElementById('parentsTableBody');
            if (!tbody) return;

            // Show loading message
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading parent data...</td></tr>';

            // Use Promise.allSettled instead of Promise.all to handle failed promises more gracefully
            const parentStudentPromises = parents.map(parent => 
                this.api.getParentStudents(parent.id)
                    .then(students => ({ parentId: parent.id, students, error: null }))
                    .catch(err => {
                        console.error(`Error fetching students for parent ${parent.id}:`, err);
                        return { parentId: parent.id, students: [], error: err };
                    })
            );

            // Using allSettled instead of all ensures we process all parents even if some requests fail
            const parentStudentsResults = await Promise.allSettled(parentStudentPromises);
            const parentStudentsMap = new Map();
            
            parentStudentsResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const { parentId, students } = result.value;
                    parentStudentsMap.set(parentId, students);
                } else {
                    // In case of rejection, set empty array for this parent
                    parentStudentsMap.set(parents[index].id, []);
                }
            });

            // Generate HTML only if we still have the element (user might have navigated away)
            if (!document.getElementById('parentsTableBody')) return;
            
            tbody.innerHTML = parents.map(parent => {
                const students = parentStudentsMap.get(parent.id) || [];
                const studentNames = students.length > 0 
                    ? students.map(s => s.full_name).join(', ') 
                    : '-';
                
                return `
                    <tr>
                        <td>${parent.full_name}</td>
                        <td>${parent.email}</td>
                        <td>${parent.contact || '-'}</td>
                        <td>${studentNames}</td>
                        <td>
                            <button onclick="AdminUI.editParent(${parent.id})" class="btn btn-secondary" title="Edit Parent">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="AdminUI.deleteParent(${parent.id})" class="btn btn-danger" title="Delete Parent">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button onclick="AdminUI.manageParentStudents(${parent.id})" class="btn btn-primary" title="Manage Students">
                                <i class="fas fa-link"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading parents:', error);
            this.showNotification('Error loading parents data. Please try again.', 'error');
            
            // Show error in table
            const tbody = document.getElementById('parentsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load parent data. Please refresh the page.</td></tr>';
            }
        }
    }

    static async loadClasses() {
        try {
            const classes = await this.api.getClasses();
            const tbody = document.getElementById('classesTableBody');
            if (!tbody) return;

            tbody.innerHTML = classes.map(class_ => `
                <tr>
                    <td>${class_.name}</td>
                    <td>${class_.teacher ? class_.teacher.full_name : '-'}</td>
                    <td>${class_.grade || '-'}</td>
                    <td>${class_.section || '-'}</td>
                    <td>
                        <button onclick="AdminUI.editClass(${class_.id})" class="btn btn-secondary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="AdminUI.deleteClass(${class_.id})" class="btn btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading classes:', error);
            this.showNotification('Error loading classes', 'error');
        }
    }

    // Modal Management
    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }
    }

    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                // Restore body scrolling
                document.body.style.overflow = '';
            }, 300); // Match the CSS transition duration
        }
    }

    // Student Modal Management
    static async showAddStudentModal() {
        document.getElementById('studentModalTitle').textContent = 'Add Student';
        document.getElementById('studentForm').reset();
        this.showModal('studentModal');
    }

    static async showEditStudentModal(id) {
        try {
            const student = await this.api.getStudent(id);
            document.getElementById('studentModalTitle').textContent = 'Edit Student';
            document.getElementById('studentForm').dataset.studentId = id;
            
            // Fill form fields
            document.getElementById('studentFullName').value = student.full_name;
            document.getElementById('studentEmail').value = student.email;
            document.getElementById('studentGrade').value = student.grade || '';
            document.getElementById('studentSection').value = student.section || '';
            document.getElementById('studentContact').value = student.contact || '';
            document.getElementById('studentPassword').value = '';
            
            this.showModal('studentModal');
        } catch (error) {
            console.error('Error loading student:', error);
            this.showNotification('Error loading student data', 'error');
        }
    }

    static closeStudentModal() {
        this.hideModal('studentModal');
    }

    static async saveStudent() {
        try {
            const form = document.getElementById('studentForm');
            const studentId = form.dataset.studentId;
            
            const studentData = {
                full_name: document.getElementById('studentFullName').value.trim(),
                email: document.getElementById('studentEmail').value.trim(),
                grade: document.getElementById('studentGrade').value.trim() || null,
                section: document.getElementById('studentSection').value.trim() || null,
                contact: document.getElementById('studentContact').value.trim() || null,
                role: 'student'
            };

            // Validate required fields
            if (!studentData.full_name || !studentData.email) {
                this.showNotification('Full name and email are required', 'error');
                return;
            }

            // Validate email format
            if (!/^\S+@\S+\.\S+$/.test(studentData.email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }

            const password = document.getElementById('studentPassword').value;
            if (password) {
                studentData.password = password;
            }

            if (studentId) {
                // Update existing student
                await this.api.updateStudent(studentId, studentData);
                this.showNotification('Student updated successfully', 'success');
            } else {
                // Create new student
                if (!password) {
                    this.showNotification('Password is required for new students', 'error');
                    return;
                }
                await this.api.createStudent(studentData);
                this.showNotification('Student added successfully', 'success');
            }

            this.closeStudentModal();
            await this.loadStudents();
        } catch (error) {
            console.error('Error saving student:', error);
            let errorMessage = 'Error saving student data';
            
            if (error.message) {
                errorMessage = `Error: ${error.message}`;
                
                // Replace common technical errors with user-friendly messages
                if (error.message.includes('duplicate key')) {
                    errorMessage = 'This email address is already registered';
                } else if (error.message.includes('validation')) {
                    errorMessage = 'Please check your input and try again';
                }
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    // Teacher Modal Management
    static async showAddTeacherModal() {
        document.getElementById('teacherModalTitle').textContent = 'Add Teacher';
        document.getElementById('teacherForm').reset();
        this.showModal('teacherModal');
    }

    static async showEditTeacherModal(id) {
        try {
            const teacher = await this.api.getTeacher(id);
            document.getElementById('teacherModalTitle').textContent = 'Edit Teacher';
            document.getElementById('teacherForm').dataset.teacherId = id;
            
            // Fill form fields
            document.getElementById('teacherFullName').value = teacher.full_name;
            document.getElementById('teacherEmail').value = teacher.email;
            document.getElementById('teacherSubject').value = teacher.subject || '';
            document.getElementById('teacherContact').value = teacher.contact || '';
            document.getElementById('teacherPassword').value = '';
            
            this.showModal('teacherModal');
        } catch (error) {
            console.error('Error loading teacher:', error);
            this.showNotification('Error loading teacher data', 'error');
        }
    }

    static closeTeacherModal() {
        this.hideModal('teacherModal');
    }

    static async saveTeacher() {
        try {
            const form = document.getElementById('teacherForm');
            const teacherId = form.dataset.teacherId;
            
            const teacherData = {
                full_name: document.getElementById('teacherFullName').value.trim(),
                email: document.getElementById('teacherEmail').value.trim(),
                subject: document.getElementById('teacherSubject').value.trim() || null,
                contact: document.getElementById('teacherContact').value.trim() || null,
                role: 'teacher'
            };

            // Validate required fields
            if (!teacherData.full_name || !teacherData.email) {
                this.showNotification('Full name and email are required', 'error');
                return;
            }

            // Validate email format
            if (!/^\S+@\S+\.\S+$/.test(teacherData.email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }

            const password = document.getElementById('teacherPassword').value;
            if (password) {
                teacherData.password = password;
            }

            if (teacherId) {
                // Update existing teacher
                await this.api.updateTeacher(teacherId, teacherData);
                this.showNotification('Teacher updated successfully', 'success');
            } else {
                // Create new teacher
                if (!password) {
                    this.showNotification('Password is required for new teachers', 'error');
                    return;
                }
                await this.api.createTeacher(teacherData);
                this.showNotification('Teacher added successfully', 'success');
            }

            this.closeTeacherModal();
            await this.loadTeachers();
        } catch (error) {
            console.error('Error saving teacher:', error);
            let errorMessage = 'Error saving teacher data';
            
            if (error.message) {
                errorMessage = `Error: ${error.message}`;
                
                // Replace common technical errors with user-friendly messages
                if (error.message.includes('duplicate key')) {
                    errorMessage = 'This email address is already registered';
                } else if (error.message.includes('validation')) {
                    errorMessage = 'Please check your input and try again';
                }
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    // Parent Modal Management
    static async showAddParentModal() {
        document.getElementById('parentModalTitle').textContent = 'Add Parent';
        const form = document.getElementById('parentForm');
        form.reset();
        // Clear any previous parent ID
        form.removeAttribute('data-parent-id');
        
        // Ensure empty fields
        document.getElementById('parentFullName').value = '';
        document.getElementById('parentEmail').value = '';
        document.getElementById('parentContact').value = '';
        document.getElementById('parentPassword').value = '';
        
        this.showModal('parentModal');
    }

    static async showEditParentModal(id) {
        try {
            const parent = await this.api.getParent(id);
            document.getElementById('parentModalTitle').textContent = 'Edit Parent';
            document.getElementById('parentForm').dataset.parentId = id;
            
            // Fill form fields
            document.getElementById('parentFullName').value = parent.full_name;
            document.getElementById('parentEmail').value = parent.email;
            document.getElementById('parentContact').value = parent.contact || '';
            document.getElementById('parentPassword').value = '';
            
            this.showModal('parentModal');
        } catch (error) {
            console.error('Error loading parent:', error);
            this.showNotification('Error loading parent data', 'error');
        }
    }

    static closeParentModal() {
        this.hideModal('parentModal');
    }

    static async saveParent() {
        try {
            const form = document.getElementById('parentForm');
            const parentId = form.dataset.parentId;
            
            const parentData = {
                full_name: document.getElementById('parentFullName').value.trim(),
                email: document.getElementById('parentEmail').value.trim(),
                contact: document.getElementById('parentContact').value.trim() || null,
                role: 'parent'
            };

            // Validate required fields
            if (!parentData.full_name || !parentData.email) {
                this.showNotification('Full name and email are required', 'error');
                return;
            }

            const password = document.getElementById('parentPassword').value;
            if (password) {
                parentData.password = password;
            }

            if (parentId) {
                // Update existing parent
                await this.api.updateParent(parentId, parentData);
                this.showNotification('Parent updated successfully', 'success');
            } else {
                // Create new parent
                if (!password) {
                    this.showNotification('Password is required for new parents', 'error');
                    return;
                }
                await this.api.createParent(parentData);
                this.showNotification('Parent added successfully', 'success');
            }

            this.closeParentModal();
            await this.loadParents();
        } catch (error) {
            console.error('Error saving parent:', error);
            this.showNotification(`Error saving parent: ${error.message || 'Unknown error'}`, 'error');
        }
    }

    // Class Modal Management
    static async showAddClassModal() {
        try {
            document.getElementById('classModalTitle').textContent = 'Add Class';
            document.getElementById('classForm').reset();
            
            // Load teachers for dropdown
            const teachers = await this.api.getTeachers();
            const teacherSelect = document.getElementById('classTeacher');
            teacherSelect.innerHTML = `
                <option value="">Select Teacher</option>
                ${teachers.map(teacher => `
                    <option value="${teacher.id}">${teacher.full_name}</option>
                `).join('')}
            `;
            
            this.showModal('classModal');
        } catch (error) {
            console.error('Error preparing class modal:', error);
            this.showNotification('Error loading teachers', 'error');
        }
    }

    static async showEditClassModal(id) {
        try {
            const [class_, teachers] = await Promise.all([
                this.api.getClass(id),
                this.api.getTeachers()
            ]);

            document.getElementById('classModalTitle').textContent = 'Edit Class';
            document.getElementById('classForm').dataset.classId = id;
            
            // Fill form fields
            document.getElementById('className').value = class_.name;
            document.getElementById('classGrade').value = class_.grade || '';
            document.getElementById('classSection').value = class_.section || '';
            
            // Populate and set teacher dropdown
            const teacherSelect = document.getElementById('classTeacher');
            teacherSelect.innerHTML = `
                <option value="">Select Teacher</option>
                ${teachers.map(teacher => `
                    <option value="${teacher.id}" ${teacher.id === class_.teacher_id ? 'selected' : ''}>
                        ${teacher.full_name}
                    </option>
                `).join('')}
            `;
            
            this.showModal('classModal');
        } catch (error) {
            console.error('Error loading class:', error);
            this.showNotification('Error loading class data', 'error');
        }
    }

    static closeClassModal() {
        this.hideModal('classModal');
    }

    static async saveClass() {
        try {
            const form = document.getElementById('classForm');
            const classId = form.dataset.classId;
            
            const classData = {
                name: document.getElementById('className').value,
                teacher_id: document.getElementById('classTeacher').value,
                grade: document.getElementById('classGrade').value,
                section: document.getElementById('classSection').value
            };

            if (classId) {
                // Update existing class
                await this.api.updateClass(classId, classData);
                this.showNotification('Class updated successfully', 'success');
            } else {
                // Create new class
                await this.api.createClass(classData);
                this.showNotification('Class added successfully', 'success');
            }

            this.closeClassModal();
            await this.loadClasses();
        } catch (error) {
            console.error('Error saving class:', error);
            this.showNotification('Error saving class data', 'error');
        }
    }

    // Parent-Student Link Management
    static async showLinkParentStudentModal(parentId) {
        try {
            const [parent, allStudents, linkedStudents] = await Promise.all([
                this.api.getParent(parentId),
                this.api.getStudents(),
                this.api.getParentStudents(parentId)
            ]);

            document.getElementById('linkParentStudentModal').dataset.parentId = parentId;
            
            // Populate available students
            const availableStudents = allStudents.filter(student => 
                !linkedStudents.some(linked => linked.id === student.id)
            );

            document.getElementById('availableStudents').innerHTML = availableStudents.map(student => `
                <option value="${student.id}">${student.full_name} (${student.grade || 'No Grade'})</option>
            `).join('');

            document.getElementById('linkedStudents').innerHTML = linkedStudents.map(student => `
                <option value="${student.id}">${student.full_name} (${student.grade || 'No Grade'})</option>
            `).join('');

            // Add instructions
            const instructions = document.createElement('p');
            instructions.className = 'modal-instructions';
            instructions.innerHTML = 'Double-click a student to move them between lists, or use the buttons below:';
            document.querySelector('#linkParentStudentModal .modal-body').insertBefore(
                instructions,
                document.querySelector('#linkParentStudentModal .form-group')
            );

            // Add move buttons
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'move-buttons';
            buttonContainer.innerHTML = `
                <button type="button" class="btn btn-secondary" id="moveToLinked">
                    <i class="fas fa-arrow-right"></i> Link Selected
                </button>
                <button type="button" class="btn btn-secondary" id="moveToAvailable">
                    <i class="fas fa-arrow-left"></i> Unlink Selected
                </button>
            `;
            document.querySelector('#linkParentStudentModal .modal-body').insertBefore(
                buttonContainer,
                document.querySelector('#linkParentStudentModal .form-group:last-child')
            );

            // Add button event listeners
            document.getElementById('moveToLinked').addEventListener('click', () => {
                const availableSelect = document.getElementById('availableStudents');
                const linkedSelect = document.getElementById('linkedStudents');
                Array.from(availableSelect.selectedOptions).forEach(option => {
                    linkedSelect.appendChild(option);
                });
            });

            document.getElementById('moveToAvailable').addEventListener('click', () => {
                const availableSelect = document.getElementById('availableStudents');
                const linkedSelect = document.getElementById('linkedStudents');
                Array.from(linkedSelect.selectedOptions).forEach(option => {
                    availableSelect.appendChild(option);
                });
            });

            this.showModal('linkParentStudentModal');
        } catch (error) {
            console.error('Error loading parent-student data:', error);
            this.showNotification('Error loading students data', 'error');
        }
    }

    static closeLinkParentStudentModal() {
        this.hideModal('linkParentStudentModal');
    }

    static async saveLinkParentStudent() {
        try {
            const modal = document.getElementById('linkParentStudentModal');
            const parentId = modal.dataset.parentId;
            
            if (!parentId) {
                this.showNotification('Parent ID not found', 'error');
                return;
            }
            
            const linkedStudentsSelect = document.getElementById('linkedStudents');
            const currentLinkedIds = Array.from(linkedStudentsSelect.options).map(option => option.value);
            
            // Get all current parent's students
            try {
                const currentStudents = await this.api.getParentStudents(parentId);
                const currentStudentIds = currentStudents.map(student => student.id.toString());
                
                // Determine changes
                const toAdd = currentLinkedIds.filter(id => !currentStudentIds.includes(id));
                const toRemove = currentStudentIds.filter(id => !currentLinkedIds.includes(id));
                
                let successCount = 0;
                let errorCount = 0;
                
                // Apply changes - Add students
                for (const studentId of toAdd) {
                    try {
                        await this.api.linkParentStudent(parentId, studentId);
                        successCount++;
                    } catch (err) {
                        console.error(`Failed to link student ${studentId} to parent ${parentId}:`, err);
                        errorCount++;
                    }
                }
                
                // Apply changes - Remove students
                for (const studentId of toRemove) {
                    try {
                        await this.api.unlinkParentStudent(parentId, studentId);
                        successCount++;
                    } catch (err) {
                        console.error(`Failed to unlink student ${studentId} from parent ${parentId}:`, err);
                        errorCount++;
                    }
                }
                
                // Show a summary notification
                if (errorCount === 0) {
                    if (successCount > 0) {
                        this.showNotification('Parent-student links updated successfully', 'success');
                    } else {
                        this.showNotification('No changes were made', 'info');
                    }
                } else if (successCount > 0) {
                    this.showNotification(`Updated ${successCount} link(s) with ${errorCount} error(s)`, 'warning');
                } else {
                    this.showNotification('Failed to update parent-student links', 'error');
                }
                
                this.closeLinkParentStudentModal();
                await this.loadParents();
            } catch (error) {
                console.error('Error fetching current student links:', error);
                this.showNotification('Failed to fetch current student links', 'error');
            }
        } catch (error) {
            console.error('Error saving parent-student links:', error);
            this.showNotification('Error updating parent-student links. Please try again.', 'error');
        }
    }

    // Setup event listeners for modals
    static setupModalEventListeners() {
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const modalId = modal.id;
                    this.hideModal(modalId);
                }
            });
        });

        // Close modals when clicking close button
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = btn.closest('.modal');
                if (modal) {
                    const modalId = modal.id;
                    this.hideModal(modalId);
                }
            });
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const visibleModal = document.querySelector('.modal.show');
                if (visibleModal) {
                    const modalId = visibleModal.id;
                    this.hideModal(modalId);
                }
            }
        });

        // Handle form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const modalId = form.closest('.modal').id;
                
                switch (modalId) {
                    case 'studentModal':
                        this.saveStudent();
                        break;
                    case 'teacherModal':
                        this.saveTeacher();
                        break;
                    case 'parentModal':
                        this.saveParent();
                        break;
                    case 'classModal':
                        this.saveClass();
                        break;
                    case 'linkParentStudentModal':
                        this.saveLinkParentStudent();
                        break;
                }
            });
        });
    }

    static handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        window.location.href = './login.html';
    }

    static showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add notification to container
        container.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
                // Remove container if empty
                if (!container.children.length) {
                    container.remove();
                }
            }, 300);
        }, 5000);
    }

    static async deleteStudent(id) {
        try {
            if (!confirm('Are you sure you want to delete this student?')) {
                return;
            }
            await this.api.deleteStudent(id);
            this.showNotification('Student deleted successfully', 'success');
            await this.loadStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showNotification('Error deleting student', 'error');
        }
    }

    static async deleteTeacher(id) {
        try {
            if (!confirm('Are you sure you want to delete this teacher?')) {
                return;
            }
            await this.api.deleteTeacher(id);
            this.showNotification('Teacher deleted successfully', 'success');
            await this.loadTeachers();
        } catch (error) {
            console.error('Error deleting teacher:', error);
            this.showNotification('Error deleting teacher', 'error');
        }
    }

    static async deleteParent(id) {
        try {
            if (!confirm('Are you sure you want to delete this parent?')) {
                return;
            }
            await this.api.deleteParent(id);
            this.showNotification('Parent deleted successfully', 'success');
            await this.loadParents();
        } catch (error) {
            console.error('Error deleting parent:', error);
            this.showNotification('Error deleting parent', 'error');
        }
    }

    static async deleteClass(id) {
        try {
            if (!confirm('Are you sure you want to delete this class?')) {
                return;
            }
            await this.api.deleteClass(id);
            this.showNotification('Class deleted successfully', 'success');
            await this.loadClasses();
        } catch (error) {
            console.error('Error deleting class:', error);
            this.showNotification('Error deleting class', 'error');
        }
    }

    static editStudent(id) {
        this.showEditStudentModal(id);
    }

    static editTeacher(id) {
        this.showEditTeacherModal(id);
    }

    static editParent(id) {
        this.showEditParentModal(id);
    }

    static editClass(id) {
        this.showEditClassModal(id);
    }

    static manageParentStudents(id) {
        this.showLinkParentStudentModal(id);
    }
}

// Initialize admin dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Defer non-critical initialization
    requestAnimationFrame(() => {
        // Check if we're on the admin page
        if (!window.location.pathname.includes('login.html')) {
            AdminUI.init().catch(error => {
                console.error('Failed to initialize admin dashboard:', error.message);
                if (error.message.includes('401') || 
                    error.message.includes('403') || 
                    error.message.includes('No authentication token found') ||
                    error.message.includes('Failed to fetch')) {
                    
                    // Show a user-friendly message before redirecting
                    if (window.AdminUI && window.AdminUI.showNotification) {
                        window.AdminUI.showNotification(
                            'Please log in to access the admin dashboard', 
                            'warning'
                        );
                    }
                    
                    // Delay redirect slightly to show the message
                    setTimeout(() => {
                        window.location.href = './login.html';
                    }, 1500);
                }
            });
        }
    });
});

// Add performance monitoring
if (window.performance && window.performance.mark) {
    window.performance.mark('adminInit-start');
    
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
                console.warn(`Performance warning: ${entry.name} took ${entry.duration}ms`);
            }
        }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    // Measure initialization time
    window.addEventListener('load', () => {
        window.performance.mark('adminInit-end');
        window.performance.measure('Admin Initialization', 'adminInit-start', 'adminInit-end');
    });
} 