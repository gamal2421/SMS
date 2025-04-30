// Mock Data
const mockData = {
    currentUser: {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@school.com',
        role: 'admin'
    },
    stats: {
        totalStudents: 450,
        totalTeachers: 35,
        totalClasses: 15,
        activeUsers: 520
    },
    recentActivities: [
        { type: 'user', action: 'New student registration', user: 'Emily Brown', time: '2 hours ago' },
        { type: 'class', action: 'New class created', details: 'Grade 10-D Mathematics', time: '3 hours ago' },
        { type: 'system', action: 'System backup completed', time: '5 hours ago' },
        { type: 'user', action: 'New teacher joined', user: 'Dr. Michael Clark', time: '1 day ago' }
    ],
    users: {
        students: [
            { id: '1', name: 'John Smith', grade: '10-A', status: 'Active', joinDate: '2023-09-01' },
            { id: '2', name: 'Sarah Johnson', grade: '11-B', status: 'Active', joinDate: '2023-09-01' },
            { id: '3', name: 'Mike Wilson', grade: '9-C', status: 'Inactive', joinDate: '2023-09-01' }
        ],
        teachers: [
            { id: '1', name: 'Dr. Jane Doe', subjects: ['Mathematics', 'Physics'], status: 'Active', joinDate: '2022-08-15' },
            { id: '2', name: 'Prof. Robert Brown', subjects: ['English', 'Literature'], status: 'Active', joinDate: '2021-07-20' },
            { id: '3', name: 'Ms. Emily White', subjects: ['Biology', 'Chemistry'], status: 'On Leave', joinDate: '2023-01-10' }
        ],
        parents: [
            { id: '1', name: 'Mr. David Wilson', children: ['Mike Wilson'], status: 'Active', joinDate: '2023-09-01' },
            { id: '2', name: 'Mrs. Linda Johnson', children: ['Sarah Johnson'], status: 'Active', joinDate: '2023-09-01' }
        ]
    },
    classes: [
        { id: '1', name: 'Grade 10-A', teacher: 'Dr. Jane Doe', students: 32, subjects: ['Mathematics', 'Physics', 'English'] },
        { id: '2', name: 'Grade 11-B', teacher: 'Prof. Robert Brown', students: 28, subjects: ['English', 'Literature', 'History'] },
        { id: '3', name: 'Grade 9-C', teacher: 'Ms. Emily White', students: 30, subjects: ['Biology', 'Chemistry', 'Physics'] }
    ],
    announcements: [
        { id: '1', title: 'School Holiday', content: 'School will be closed for spring break from March 20-28', date: '2024-03-15', priority: 'high' },
        { id: '2', title: 'Parent-Teacher Meeting', content: 'Annual parent-teacher meeting scheduled for April 5', date: '2024-03-10', priority: 'medium' }
    ],
    reports: {
        attendance: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            data: [92, 88, 95, 91, 94]
        },
        performance: {
            labels: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
            data: [85, 88, 82, 90]
        }
    }
};

// UI Management and Event Handlers
const AdminUI = {
    // Initialize UI
    init() {
        this.setupEventListeners();
        this.loadUserProfile();
        this.updateDashboard();
        this.renderClasses();
        this.renderStudents();
        this.renderTeachers();
    },

    setupEventListeners() {
        // Setup modal handlers
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.hideModal(event.target.id);
            }
        });

        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', (event) => {
                const modal = event.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        document.querySelectorAll('.cancel-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const modal = event.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Set up form submissions with validation
        const forms = {
            'addClassForm': this.handleClassFormSubmit,
            'addStudentForm': this.handleStudentFormSubmit,
            'addTeacherForm': this.handleTeacherFormSubmit
        };

        Object.entries(forms).forEach(([formId, handler]) => {
            const form = document.getElementById(formId);
            if (form) {
                this.setupFormValidation(form);
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (this.validateForm(form)) {
                        handler.call(this, e);
                    }
                });
            }
        });

        // Set up logout handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => AdminSystem.logout());
        }

        // Handle escape key for modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const openModal = document.querySelector('.modal[style*="display: block"]');
                if (openModal) {
                    this.hideModal(openModal.id);
                }
            }
        });
    },

    setupFormValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Add error message element
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            input.parentNode.insertBefore(errorDiv, input.nextSibling);

            // Real-time validation
            input.addEventListener('input', () => {
                this.validateInput(input);
            });

            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    },

    validateInput(input) {
        const errorDiv = input.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('error-message')) return;

        if (!input.checkValidity()) {
            let message = input.validationMessage;
            if (input.validity.valueMissing) {
                message = `${input.labels[0]?.textContent || 'This field'} is required`;
            } else if (input.validity.typeMismatch) {
                message = `Please enter a valid ${input.type}`;
            } else if (input.validity.patternMismatch && input.type === 'tel') {
                message = 'Please enter a valid phone number (e.g., 123-456-7890)';
            }
            errorDiv.textContent = message;
            input.classList.add('invalid');
        } else {
            errorDiv.textContent = '';
            input.classList.remove('invalid');
        }
    },

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            this.validateInput(input);
            if (!input.checkValidity()) {
                isValid = false;
            }
        });

        return isValid;
    },

    // User Profile UI
    loadUserProfile() {
        const user = AdminSystem.getCurrentUser();
        document.getElementById('userAvatar').textContent = user.initials;
        document.getElementById('userName').textContent = user.name;
    },

    // Tab Management
    openTab(tabName) {
        const tabContents = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[onclick="AdminUI.openTab('${tabName}')"]`).classList.add('active');

        // Update content based on tab
        switch(tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'students':
                this.renderStudents();
                break;
            case 'teachers':
                this.renderTeachers();
                break;
            case 'classes':
                this.renderClasses();
                break;
        }
    },

    // Dashboard UI Updates
    updateDashboard() {
        this.updateDashboardStats();
        this.updateActivitiesList();
    },

    updateDashboardStats() {
        const stats = AdminSystem.getDashboardStats();
        document.getElementById('totalStudents').textContent = stats.students;
        document.getElementById('totalTeachers').textContent = stats.teachers;
        document.getElementById('totalClasses').textContent = stats.classes;
        document.getElementById('totalParents').textContent = stats.parents;
    },

    updateActivitiesList() {
        const activities = AdminSystem.getActivities();
        const activitiesList = document.getElementById('activitiesList');
        if (!activitiesList) return;

        activitiesList.innerHTML = activities.map(activity => `
            <li class="activity-item">
                <i class="fas fa-bell"></i>
                <span>${activity.action}</span>
                <small>${activity.timestamp}</small>
            </li>
        `).join('');
    },

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            delete form.dataset.editId;
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('invalid');
                const errorDiv = input.nextElementSibling;
                if (errorDiv && errorDiv.classList.contains('error-message')) {
                    errorDiv.textContent = '';
                }
            });
        }

        // If showing add class modal, populate teacher dropdown
        if (modalId === 'addClassModal') {
            this.populateTeacherDropdown();
        }

        modal.style.display = 'block';
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'none';
    },

    // Class Management UI
    populateTeacherDropdown() {
        const teacherSelect = document.getElementById('classTeacher');
        if (!teacherSelect) return;

        const teachers = AdminSystem.getTeachers();
        
        // Clear existing options
        teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
        
        // Add teacher options
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = `${teacher.firstName} ${teacher.lastName}`;
            option.textContent = `${teacher.firstName} ${teacher.lastName} (${teacher.subject})`;
            teacherSelect.appendChild(option);
        });
    },

    renderClasses() {
        const tableBody = document.getElementById('classesTableBody');
        if (!tableBody) return;

        const classes = AdminSystem.getClasses();
        
        tableBody.innerHTML = classes.map(cls => `
            <tr>
                <td>${cls.name}</td>
                <td>${cls.grade}</td>
                <td>${cls.teacher}</td>
                <td>${cls.currentStudents}/${cls.capacity}</td>
                <td>
                    <button class="btn btn-small" onclick="AdminUI.showEditClassModal(${cls.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="AdminUI.deleteClass(${cls.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    showEditClassModal(classId) {
        const classData = AdminSystem.getClasses().find(c => c.id === classId);
        if (!classData) return;

        // Show the modal and populate fields
        const modal = document.getElementById('addClassModal');
        if (!modal) return;

        this.showModal('addClassModal');

        // Update modal title
        modal.querySelector('.modal-title').textContent = 'Edit Class';

        // Populate form fields
        document.getElementById('className').value = classData.name;
        document.getElementById('classGrade').value = classData.grade;
        document.getElementById('classTeacher').value = classData.teacher;
        document.getElementById('classSubject').value = classData.subject;
        document.getElementById('classCapacity').value = classData.capacity;
        document.getElementById('classSchedule').value = classData.schedule;
        document.getElementById('classDescription').value = classData.description || '';

        // Update form submission handler
        const form = document.getElementById('addClassForm');
        if (form) {
            form.onsubmit = (e) => this.handleClassFormSubmit(e, classId);
        }
    },

    async deleteClass(classId) {
        if (!confirm('Are you sure you want to delete this class?')) return;

        const result = AdminSystem.deleteClass(classId);
        
        if (result.success) {
            this.showNotification('Class deleted successfully', 'success');
            this.renderClasses();
            this.updateDashboardStats();
        } else {
            this.showNotification(result.error || 'Failed to delete class', 'error');
        }
    },

    handleClassFormSubmit(event, classId = null) {
        event.preventDefault();
        
        const formData = {
            name: document.getElementById('className').value,
            grade: document.getElementById('classGrade').value,
            teacher: document.getElementById('classTeacher').value,
            subject: document.getElementById('classSubject').value,
            capacity: parseInt(document.getElementById('classCapacity').value),
            schedule: document.getElementById('classSchedule').value,
            description: document.getElementById('classDescription').value
        };

        let result;
        if (classId) {
            // Edit existing class
            result = AdminSystem.updateClass(classId, formData);
        } else {
            // Add new class
            result = AdminSystem.addClass(formData);
        }

        if (result.success) {
            this.showNotification(
                `Class ${classId ? 'updated' : 'added'} successfully`,
                'success'
            );
            this.hideModal('addClassModal');
            this.renderClasses();
            this.updateDashboardStats();
        } else {
            this.showNotification(result.error || 'Operation failed', 'error');
        }
    },

    // Students Management
    renderStudents() {
        const tableBody = document.getElementById('studentsTableBody');
        if (!tableBody) return;

        const students = AdminSystem.getStudents();
        
        tableBody.innerHTML = students.map(student => `
            <tr>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.grade}</td>
                <td>${student.section}</td>
                <td>${student.contact}</td>
                <td>
                    <button class="btn btn-small" onclick="AdminUI.editStudent(${student.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="AdminUI.deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    handleStudentFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const studentData = Object.fromEntries(formData.entries());

        try {
            if (form.dataset.editId) {
                // Update existing student
                const result = AdminSystem.updateStudent(parseInt(form.dataset.editId), studentData);
                if (result) {
                    this.showNotification('Student updated successfully');
                    this.hideModal('addStudentModal');
                    this.renderStudents();
                }
            } else {
                // Add new student
                const result = AdminSystem.addStudent(studentData);
                if (result) {
                    this.showNotification('Student added successfully');
                    this.hideModal('addStudentModal');
                    this.renderStudents();
                }
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    },

    editStudent(id) {
        const student = AdminSystem.getStudents().find(s => s.id === id);
        if (!student) return;

        const form = document.getElementById('addStudentForm');
        if (!form) return;

        // Update modal title
        const modalTitle = document.querySelector('#addStudentModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Student';
        }

        // Fill form with student data
        document.getElementById('studentFirstName').value = student.firstName;
        document.getElementById('studentLastName').value = student.lastName;
        document.getElementById('studentEmail').value = student.email;
        document.getElementById('studentGrade').value = student.grade;
        document.getElementById('studentSection').value = student.section;
        document.getElementById('studentContact').value = student.contact;

        // Set form to edit mode
        form.dataset.editId = id;

        this.showModal('addStudentModal');
    },

    deleteStudent(id) {
        if (!confirm('Are you sure you want to delete this student?')) return;

        if (AdminSystem.deleteStudent(id)) {
            this.showNotification('Student deleted successfully', 'success');
            this.renderStudents();
            this.updateDashboardStats();
        } else {
            this.showNotification('Failed to delete student', 'error');
        }
    },

    // Teachers Management
    renderTeachers() {
        const tableBody = document.getElementById('teachersTableBody');
        if (!tableBody) return;

        const teachers = AdminSystem.getTeachers();
        
        tableBody.innerHTML = teachers.map(teacher => `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-name">${teacher.firstName} ${teacher.lastName}</div>
                        <div class="user-email">${teacher.email}</div>
                    </div>
                </td>
                <td>
                    <div class="subject-info">
                        <div class="subject-name">${teacher.subject}</div>
                        <div class="qualification">${teacher.qualification}</div>
                    </div>
                </td>
                <td>
                    <div class="classes-list">
                        ${teacher.assignedClasses.length ? 
                            teacher.assignedClasses.map(cls => `<span class="class-tag">${cls}</span>`).join('') :
                            '<span class="no-classes">No classes assigned</span>'
                        }
                    </div>
                </td>
                <td>${teacher.contact}</td>
                <td>
                    <button class="btn btn-small" onclick="AdminUI.editTeacher(${teacher.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-info" onclick="AdminUI.viewTeacherDetails(${teacher.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="AdminUI.deleteTeacher(${teacher.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    handleTeacherFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const teacherData = Object.fromEntries(formData.entries());

        try {
            if (form.dataset.editId) {
                // Update existing teacher
                const result = AdminSystem.updateTeacher(parseInt(form.dataset.editId), teacherData);
                if (result) {
                    this.showNotification('Teacher updated successfully');
                    this.hideModal('addTeacherModal');
                    this.renderTeachers();
                }
            } else {
                // Add new teacher
                const result = AdminSystem.addTeacher(teacherData);
                if (result) {
                    this.showNotification('Teacher added successfully');
                    this.hideModal('addTeacherModal');
                    this.renderTeachers();
                }
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    },

    editTeacher(id) {
        const teacher = AdminSystem.getTeachers().find(t => t.id === id);
        if (!teacher) return;

        const form = document.getElementById('addTeacherForm');
        if (!form) return;

        // Update modal title
        const modalTitle = document.querySelector('#addTeacherModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Teacher';
        }

        // Fill form with teacher data
        document.getElementById('teacherFirstName').value = teacher.firstName;
        document.getElementById('teacherLastName').value = teacher.lastName;
        document.getElementById('teacherEmail').value = teacher.email;
        document.getElementById('teacherSubject').value = teacher.subject;
        document.getElementById('teacherContact').value = teacher.contact;
        document.getElementById('teacherQualification').value = teacher.qualification || '';
        document.getElementById('teacherBio').value = teacher.bio || '';

        // Set form to edit mode
        form.dataset.editId = id;

        this.showModal('addTeacherModal');
    },

    viewTeacherDetails(id) {
        const teacher = AdminSystem.getTeachers().find(t => t.id === id);
        if (!teacher) return;

        const detailsHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Teacher Details</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="teacher-profile">
                        <div class="teacher-header">
                            <div class="teacher-avatar">
                                ${teacher.firstName[0]}${teacher.lastName[0]}
                            </div>
                            <div class="teacher-info">
                                <h3>${teacher.firstName} ${teacher.lastName}</h3>
                                <p class="teacher-subject">${teacher.subject}</p>
                            </div>
                        </div>
                        <div class="teacher-details">
                            <p><strong>Email:</strong> ${teacher.email}</p>
                            <p><strong>Contact:</strong> ${teacher.contact}</p>
                            <p><strong>Qualification:</strong> ${teacher.qualification}</p>
                            <p><strong>Bio:</strong> ${teacher.bio || 'No bio available'}</p>
                        </div>
                        <div class="teacher-classes">
                            <h4>Assigned Classes</h4>
                            ${teacher.assignedClasses.length ? `
                                <ul class="classes-list">
                                    ${teacher.assignedClasses.map(cls => `
                                        <li class="class-item">${cls}</li>
                                    `).join('')}
                                </ul>
                            ` : '<p>No classes assigned</p>'}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn cancel-btn">Close</button>
                </div>
            </div>
        `;

        // Create modal element if it doesn't exist
        let modal = document.getElementById('teacherDetailsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'teacherDetailsModal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = detailsHTML;
        this.showModal('teacherDetailsModal');
    },

    deleteTeacher(id) {
        if (!confirm('Are you sure you want to delete this teacher?')) return;

        const result = AdminSystem.deleteTeacher(id);
        if (result.success) {
            this.showNotification('Teacher deleted successfully', 'success');
            this.renderTeachers();
            this.updateDashboardStats();
        } else {
            this.showNotification(result.error || 'Failed to delete teacher', 'error');
        }
    },

    // Notification System
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => AdminUI.init());