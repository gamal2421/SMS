class TeacherUI {
    constructor() {
        // Prevent multiple initializations
        if (window.teacherUI) {
            console.warn('TeacherUI already initialized');
            return window.teacherUI;
        }
<<<<<<< HEAD
        
        this.api = new TeacherAPI();
        this.teacherId = null;
        this.initialized = false;
        this.isSubmittingAssignment = false;  // Add flag for assignment submission
        this.teacher = null;
        this.classes = [];
        this.assignments = [];
        this.selectedStudents = new Set();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize
        this.init().catch(error => {
            console.error('Error during initialization:', error);
            if (error.message.includes('401') || error.message.includes('403') || error.message.includes('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                window.location.href = './login.html';
            } else {
                this.showNotification('Error initializing the dashboard', 'error');
            }
        });
        
        // Store instance
        window.teacherUI = this;
    }

    async init() {
        // Prevent multiple initializations
        if (this.initialized) {
            console.warn('TeacherUI already initialized');
            return;
        }

        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = './login.html';
            return;
        }

        // Verify teacher role
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'teacher') {
            window.location.href = './login.html';
            return;
        }

        try {
            // Get current user info
            const userData = await this.api.getCurrentUser();
            if (!userData || userData.role !== 'teacher') {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                window.location.href = './login.html';
                return;
            }

            // Store teacher ID
            this.teacherId = userData.id;

            // Update user info display
            this.updateUserInfo(userData);
            
            // Load dashboard data
            await this.loadDashboard();
            
            // Load initial data for the active tab
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                await this.loadTabContent(activeTab.getAttribute('data-tab'));
            }

            // Mark as initialized
            this.initialized = true;
=======
    ]
};

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}
>>>>>>> bd2aa6b26b1b74a5ce711fbbdce6b42612ef8105

        } catch (error) {
            console.error('Error during initialization:', error);
            throw error; // Re-throw to be caught by the constructor
        }
    }

<<<<<<< HEAD
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const tabId = e.target.closest('.tab-btn').getAttribute('data-tab');
                if (tabId) {
                    await this.openTab(tabId);
                }
=======
// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize TeacherUI
    TeacherUI.init();
});

const TeacherUI = {
    init() {
        this.setupEventListeners();
        this.loadInitialData();
    },

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabId);
>>>>>>> bd2aa6b26b1b74a5ce711fbbdce6b42612ef8105
            });
        });

        // Logout button
<<<<<<< HEAD
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Create Assignment button
        const createAssignmentBtn = document.querySelector('.create-assignment-btn');
        if (createAssignmentBtn) {
            createAssignmentBtn.addEventListener('click', () => this.createAssignment());
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Modal cancel buttons
        document.querySelectorAll('.modal .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Save Assignment button in create modal
        const saveAssignmentBtn = document.querySelector('#createAssignmentModal .btn-primary');
        if (saveAssignmentBtn) {
            saveAssignmentBtn.addEventListener('click', () => this.saveAssignment());
        }

        // Save Edited Assignment button in edit modal
        const saveEditedAssignmentBtn = document.querySelector('#editAssignmentModal .btn-primary');
        if (saveEditedAssignmentBtn) {
            saveEditedAssignmentBtn.addEventListener('click', () => this.saveEditedAssignment());
        }

        // Class selection events
        const gradesClass = document.getElementById('gradesClass');
        if (gradesClass) {
            gradesClass.addEventListener('change', () => this.loadGrades());
        }

        // Assignment selection events
        const gradesAssignment = document.getElementById('gradesAssignment');
        if (gradesAssignment) {
            gradesAssignment.addEventListener('change', () => this.loadGrades());
        }

        // Attendance filters
        const attendanceClass = document.getElementById('attendanceClass');
        const attendanceDate = document.getElementById('attendanceDate');
        if (attendanceClass && attendanceDate) {
            attendanceClass.addEventListener('change', () => this.loadAttendance());
            attendanceDate.addEventListener('change', () => this.loadAttendance());
        }
    }

    updateUserInfo(userData) {
        const userInitials = document.getElementById('userInitials');
        const userName = document.getElementById('userName');
        
        if (userInitials) {
            userInitials.textContent = userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        if (userName) {
            userName.textContent = userData.full_name;
        }
    }

    async loadDashboard() {
        try {
            const [stats, activities] = await Promise.all([
                this.api.getDashboardStats(),
                this.api.getRecentActivities()
            ]);
            
            // Update dashboard statistics
            document.getElementById('totalStudents').textContent = stats.total_students || 0;
            document.getElementById('totalClasses').textContent = stats.total_classes || 0;
            document.getElementById('totalAssignments').textContent = stats.active_assignments || 0;
            document.getElementById('avgAttendance').textContent = `${stats.average_attendance || 0}%`;
            document.getElementById('recentSubmissions').textContent = stats.recent_submissions || 0;
            document.getElementById('averageGrade').textContent = stats.average_grade || 0;

            // Update recent activities
            const activitiesContainer = document.getElementById('recentActivities');
            if (activitiesContainer) {
                if (activities && activities.length > 0) {
                activitiesContainer.innerHTML = activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                        </div>
                        <div class="activity-details">
                            <div class="activity-title">${activity.title}</div>
                            <div class="activity-time">${this.formatDate(activity.timestamp)}</div>
                        </div>
                    </div>
                `).join('');
                } else {
                    activitiesContainer.innerHTML = '<div class="no-activities">No recent activities</div>';
                }
            }

            // If there was an error in the stats, show it
            if (stats.error) {
                console.warn('Dashboard stats error:', stats.error);
                this.showNotification('Some dashboard statistics may be incomplete', 'warning');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showNotification('Error loading dashboard data', 'error');
            
            // Set default values for stats
            document.getElementById('totalStudents').textContent = '0';
            document.getElementById('totalClasses').textContent = '0';
            document.getElementById('totalAssignments').textContent = '0';
            document.getElementById('avgAttendance').textContent = '0%';
            document.getElementById('recentSubmissions').textContent = '0';
            document.getElementById('averageGrade').textContent = '0';
            
            // Show empty state for activities
            const activitiesContainer = document.getElementById('recentActivities');
            if (activitiesContainer) {
                activitiesContainer.innerHTML = '<div class="no-activities">Unable to load activities</div>';
            }
        }
    }

    async openTab(tabId) {
        try {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
        });
            const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
        });
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.style.display = 'block';
            }

        // Load tab content
        await this.loadTabContent(tabId);
        } catch (error) {
            console.error('Error switching tabs:', error);
            this.showNotification('Error switching tabs', 'error');
        }
    }

    async loadTabContent(tabId) {
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
                // Load classes into the select dropdown
                const attendanceClassSelect = document.getElementById('attendanceClass');
                const attendanceClasses = await this.api.getClasses();
                attendanceClassSelect.innerHTML = `
                    <option value="">Select Class</option>
                    ${attendanceClasses.map(c => `<option value="${c.id}">${c.name} - ${c.grade}${c.section}</option>`).join('')}
                `;
                
                // Set today's date as default
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('attendanceDate').value = today;
                break;
            case 'grades':
                // Load classes into the select dropdown
                const gradesClassSelect = document.getElementById('gradesClass');
                const gradesClasses = await this.api.getClasses();
                gradesClassSelect.innerHTML = `
                    <option value="">Select Class</option>
                    ${gradesClasses.map(c => `<option value="${c.id}">${c.name} - ${c.grade}${c.section}</option>`).join('')}
                `;
                this.resetGradeStats();
                break;
            case 'profile':
                await this.loadProfile();
                break;
        }
    }

    async loadProfile() {
        try {
            const userData = await this.api.getCurrentUser();
            if (!userData) {
                this.showNotification('Error loading profile data', 'error');
                return;
            }

            // Update profile display
            document.getElementById('profileInitials').textContent = this.getInitials(userData.full_name);
            document.getElementById('profileName').textContent = userData.full_name || 'Not set';
            document.getElementById('profileEmail').textContent = userData.email || 'Not set';
            document.getElementById('profileSubject').textContent = userData.subject || 'Not set';
            document.getElementById('profileContact').textContent = userData.contact || 'Not set';
            document.getElementById('profileQualification').textContent = userData.qualification || 'Not set';
            document.getElementById('profileBio').textContent = userData.bio || 'No bio available';

            // Store current values for edit form
            this.currentProfile = {
                full_name: userData.full_name,
                email: userData.email,
                subject: userData.subject,
                contact: userData.contact,
                qualification: userData.qualification,
                bio: userData.bio
            };
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showNotification('Error loading profile data', 'error');
        }
    }

    async editProfile() {
        try {
            const userData = await this.api.getCurrentUser();
            if (!userData) {
                this.showNotification('Error loading profile data', 'error');
                return;
            }

            // Populate the edit form
            document.getElementById('editFullName').value = userData.full_name;
            document.getElementById('editContact').value = userData.contact || '';
            document.getElementById('editQualification').value = userData.qualification || '';
            document.getElementById('editBio').value = userData.bio || '';
            document.getElementById('editPassword').value = '';

            // Show the modal
            this.showModal('editProfileModal');
        } catch (error) {
            console.error('Error loading profile for editing:', error);
            this.showNotification('Error loading profile data', 'error');
        }
    }

    async saveProfile() {
        try {
            const data = {
                full_name: document.getElementById('editFullName').value.trim(),
                contact: document.getElementById('editContact').value.trim(),
                qualification: document.getElementById('editQualification').value.trim(),
                bio: document.getElementById('editBio').value.trim()
            };

            // Only include password if it was changed
            const password = document.getElementById('editPassword').value.trim();
            if (password) {
                data.password = password;
            }

            // Validate required fields
            if (!data.full_name) {
                this.showNotification('Full name is required', 'error');
                return;
            }

            // Update profile
            await this.api.updateProfile(data);
            
            // Close modal and refresh data
            this.closeModal('editProfileModal');
            this.showNotification('Profile updated successfully', 'success');
            
            // Reload profile data and update header
            await this.loadProfile();
            await this.loadUserInfo();
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Error updating profile', 'error');
        }
    }

    getInitials(name) {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    }

    async loadClasses() {
        try {
            console.log('Loading classes...');
            const classes = await this.api.getClasses();
            console.log('Classes received:', classes);
            
            const tableBody = document.getElementById('classesTableBody');
            if (tableBody) {
                tableBody.innerHTML = classes.map(classInfo => `
                        <tr>
                            <td>${classInfo.name}</td>
                            <td>${classInfo.grade}</td>
                            <td>${classInfo.section}</td>
                            <td>${classInfo.current_students}/${classInfo.capacity}</td>
                            <td>${classInfo.schedule || 'Not set'}</td>
                            <td>${classInfo.room || 'Not assigned'}</td>
                            <td>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-view" onclick="teacherUI.viewClass(${classInfo.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            this.showNotification('Failed to load classes', 'error');
        }
    }

    async loadAssignments() {
        try {
            console.log('Loading assignments...');
            const assignments = await this.api.getAssignments();
            console.log('Assignments loaded:', assignments);
            
            const tableBody = document.getElementById('assignmentsTableBody');
            if (!tableBody) {
                console.error('Assignment table body element not found');
                return;
            }

            if (!assignments || assignments.length === 0) {
                console.log('No assignments found');
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No assignments found. Create a new assignment to get started.</td></tr>';
                return;
            }

            // Create a Set to store unique assignment IDs
            const uniqueAssignments = new Map();
            assignments.forEach(assignment => {
                if (assignment && assignment.id) {
                    uniqueAssignments.set(assignment.id, assignment);
                } else {
                    console.warn('Found invalid assignment in response:', assignment);
                }
            });

            // Sort assignments by due date (most recent first)
            const sortedAssignments = Array.from(uniqueAssignments.values())
                .filter(a => a && a.due_date) // Ensure we have valid assignments with due dates
                .sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

            console.log('Sorted assignments:', sortedAssignments);
            
            if (sortedAssignments.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No valid assignments found</td></tr>';
                return;
            }

            tableBody.innerHTML = sortedAssignments.map(assignment => {
                // Ensure all necessary properties exist
                const title = assignment.title || 'Untitled';
                const className = assignment.class_name || 'Unknown Class';
                const dueDate = assignment.due_date ? this.formatDate(assignment.due_date) : 'No due date';
                const status = assignment.status || 'Unknown';
                const totalSubmissions = assignment.submission_stats?.total_submissions || 0;
                const totalStudents = assignment.total_students || 0;
                const gradedSubmissions = assignment.submission_stats?.graded_submissions || 0;
                
                return `
                    <tr>
                        <td>${title}</td>
                        <td>${className}</td>
                        <td>${dueDate}</td>
                        <td>
                            <span class="status-badge status-${status.toLowerCase()}">
                                ${status}
                            </span>
                        </td>
                        <td>
                            ${totalSubmissions} / ${totalStudents}
                            (${gradedSubmissions} graded)
                        </td>
                        <td class="actions">
                            <button class="btn btn-sm btn-view" onclick="window.teacherUI.viewAssignment(${assignment.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-edit" onclick="window.teacherUI.editAssignment(${assignment.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-delete" onclick="window.teacherUI.deleteAssignment(${assignment.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading assignments:', error);
            const tableBody = document.getElementById('assignmentsTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading assignments. Please try again.</td></tr>';
            }
            this.showNotification('Failed to load assignments', 'error');
        }
    }

    async loadAttendance() {
        const classId = document.getElementById('attendanceClass').value;
        const date = document.getElementById('attendanceDate').value;
        
        if (!classId || !date) {
            this.showNotification('Please select both class and date', 'warning');
            return;
        }

        try {
            const attendance = await this.api.getAttendance(classId, date);
            const tableBody = document.getElementById('attendanceTableBody');
            if (!tableBody) return;

            // Sort attendance records by student name
            attendance.sort((a, b) => {
                const nameA = a.student_name || '';
                const nameB = b.student_name || '';
                return nameA.localeCompare(nameB);
            });

            tableBody.innerHTML = attendance.map(record => `
                <tr data-student-id="${record.student_id}">
                    <td>
                        <input type="checkbox" class="student-select" onchange="window.teacherUI.handleStudentSelect()">
                    </td>
                    <td>${record.student_name || 'Unknown Student'}</td>
                    <td>
                        <select class="status-select form-control" onchange="teacherUI.updateAttendance('${record.id}', this.value)">
                            <option value="present" ${record.status === 'present' ? 'selected' : ''}>Present</option>
                            <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>Absent</option>
                            <option value="late" ${record.status === 'late' ? 'selected' : ''}>Late</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="notes-input form-control" 
                               value="${record.notes || ''}"
                               onchange="teacherUI.updateAttendance('${record.id}', undefined, this.value)">
                    </td>
                    <td>
                        <button class="btn btn-sm btn-view" onclick="teacherUI.viewAttendanceHistory('${record.student_id}')">
=======
        document.querySelector('[data-action="logout"]').addEventListener('click', () => {
            window.location.href = 'login.html';
        });

        // Create assignment buttons
        document.querySelectorAll('[data-action="create-assignment"]').forEach(button => {
            button.addEventListener('click', () => this.showCreateAssignmentModal());
        });

        // Setup attendance date change
        const attendanceDate = document.getElementById('attendanceDate');
        if (attendanceDate) {
            attendanceDate.value = new Date().toISOString().split('T')[0];
            attendanceDate.addEventListener('change', () => this.loadAttendanceData());
        }

        // Setup class selection for attendance and grades
        ['attendanceClass', 'gradesClass'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', () => {
                    if (id === 'attendanceClass') this.loadAttendanceData();
                    else this.loadGradesData();
                });
            }
        });
    },

    loadInitialData() {
        // Load teacher profile
        const teacher = mockData.currentUser;
        document.getElementById('userName').textContent = `${teacher.firstName} ${teacher.lastName}`;
        document.getElementById('userAvatar').textContent = Utils.getInitials(`${teacher.firstName} ${teacher.lastName}`);

        // Load dashboard data
        this.updateDashboardStats();
        this.loadTodayClasses();
        this.loadPendingTasks();

        // Populate class dropdowns
        this.populateClassDropdowns();
    },

    switchTab(tabId) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });

        // Update visible content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-section`).classList.add('active');

        // Load tab-specific data
        switch(tabId) {
            case 'dashboard':
                this.updateDashboardStats();
                this.loadTodayClasses();
                this.loadPendingTasks();
                break;
            case 'classes':
                this.loadClasses();
                break;
            case 'assignments':
                this.loadAssignments();
                break;
            case 'attendance':
                this.loadAttendanceData();
                break;
            case 'grades':
                this.loadGradesData();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    },

    updateDashboardStats() {
        document.getElementById('totalClasses').textContent = mockData.stats.totalClasses;
        document.getElementById('totalStudents').textContent = mockData.stats.totalStudents;
        document.getElementById('totalAssignments').textContent = mockData.stats.totalAssignments;
        document.getElementById('avgAttendance').textContent = mockData.stats.attendanceRate + '%';
    },

    loadTodayClasses() {
        const todayClasses = document.getElementById('todayClassesList');
        if (!todayClasses) return;

        todayClasses.innerHTML = mockData.schedule.map(cls => `
            <li class="schedule-item">
                <div class="schedule-time">${cls.time}</div>
                <div class="schedule-info">
                    <div class="class-name">${cls.class}</div>
                    <div class="room-info">${cls.room}</div>
                </div>
            </li>
        `).join('');
    },

    loadPendingTasks() {
        const pendingTasks = document.getElementById('pendingTasksList');
        if (!pendingTasks) return;

        const tasks = mockData.assignments
            .filter(assignment => assignment.status === 'Active')
            .map(assignment => `
                <li class="task-item">
                    <div class="task-info">
                        <div class="task-title">${assignment.title}</div>
                        <div class="task-meta">Due: ${Utils.formatDate(assignment.dueDate)}</div>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-small" onclick="TeacherUI.viewAssignment(${assignment.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </li>
            `).join('');

        pendingTasks.innerHTML = tasks || '<li class="no-tasks">No pending tasks</li>';
    },

    populateClassDropdowns() {
        ['attendanceClass', 'gradesClass'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = '<option value="">Select Class</option>' +
                    mockData.classes.map(cls => 
                        `<option value="${cls.name}" ${cls.name === id.replace('Class ', '') ? 'selected' : ''}>${cls.name}</option>`
                    ).join('');
            }
        });
    },

    loadClasses() {
        const tableBody = document.getElementById('classesTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = mockData.classes.map(className => {
            const studentsInClass = mockData.students.filter(student => student.grade === className.name);
            return `
                <tr>
                    <td>${className.name}</td>
                    <td>${className.name.match(/\d+/)[0]}</td>
                    <td>${studentsInClass.length}</td>
                    <td>${mockData.schedule.find(s => s.class === className.name)?.time || 'N/A'}</td>
                    <td>
                        <button class="btn btn-small" onclick="TeacherUI.viewClass('${className.name}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-small btn-primary" onclick="TeacherUI.createAssignment('${className.name}')">
                            <i class="fas fa-plus"></i> Assignment
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    loadAssignments() {
        const tableBody = document.getElementById('assignmentsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = mockData.assignments.map(assignment => `
            <tr>
                <td>${assignment.title}</td>
                <td>${assignment.class}</td>
                <td>${Utils.formatDate(assignment.dueDate)}</td>
                <td>
                    <span class="status-badge ${assignment.status}">
                        ${assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-small" onclick="TeacherUI.viewAssignment(${assignment.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-small btn-primary" onclick="TeacherUI.editAssignment(${assignment.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="TeacherUI.deleteAssignment(${assignment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    loadAttendanceData() {
        const classId = document.getElementById('attendanceClass').value;
        const date = document.getElementById('attendanceDate').value;
        const tableBody = document.getElementById('attendanceTableBody');
        
        if (!classId || !date || !tableBody) {
            tableBody.innerHTML = '<tr><td colspan="4" class="no-data">Select a class and date to view attendance</td></tr>';
            return;
        }

        const studentsInClass = mockData.students.filter(student => student.grade === classId.replace('Class ', ''));
        const attendanceData = mockData.assignments.filter(a => a.class === classId.replace('Class ', ''));

        tableBody.innerHTML = studentsInClass.map(student => {
            const attendance = attendanceData.find(a => a.id === student.id) || { status: 'unknown', notes: '' };
            return `
                <tr>
                    <td>${student.name}</td>
                    <td>
                        <select class="attendance-select" onchange="TeacherUI.updateAttendance(${student.id}, this.value)">
                            <option value="present" ${attendance.status === 'present' ? 'selected' : ''}>Present</option>
                            <option value="absent" ${attendance.status === 'absent' ? 'selected' : ''}>Absent</option>
                            <option value="late" ${attendance.status === 'late' ? 'selected' : ''}>Late</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="notes-input" value="${attendance.notes}"
                            onchange="TeacherUI.updateAttendanceNotes(${student.id}, this.value)">
                    </td>
                    <td>
                        <button class="btn btn-small" onclick="TeacherUI.viewStudentAttendance(${student.id})">
>>>>>>> bd2aa6b26b1b74a5ce711fbbdce6b42612ef8105
                            <i class="fas fa-history"></i>
                        </button>
                    </td>
                </tr>
<<<<<<< HEAD
            `).join('');

            // Update attendance statistics
            this.updateAttendanceStats();
        } catch (error) {
            console.error('Error loading attendance:', error);
            this.showNotification('Failed to load attendance records', 'error');
        }
    }

    updateAttendanceStats() {
        const rows = document.querySelectorAll('#attendanceTableBody tr');
        let present = 0, absent = 0, late = 0;

        rows.forEach(row => {
            const status = row.querySelector('.status-select').value;
            if (status === 'present') present++;
            else if (status === 'absent') absent++;
            else if (status === 'late') late++;
        });

        const total = rows.length;
        const attendanceRate = total > 0 ? Math.round((present + (late * 0.5)) / total * 100) : 0;

        document.getElementById('presentCount').textContent = present;
        document.getElementById('absentCount').textContent = absent;
        document.getElementById('lateCount').textContent = late;
        document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
    }

    async updateAttendance(attendanceId, status, notes) {
        try {
            const data = {};
            if (status !== undefined) data.status = status;
            if (notes !== undefined) data.notes = notes;

            await this.api.updateAttendance(attendanceId, data);
            this.updateAttendanceStats();
        } catch (error) {
            console.error('Error updating attendance:', error);
            this.showNotification('Failed to update attendance', 'error');
        }
    }

    toggleAllStudents(checked) {
        document.querySelectorAll('.student-select').forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.handleStudentSelect();
    }

    handleStudentSelect() {
        const selectedCount = document.querySelectorAll('.student-select:checked').length;
        const bulkActions = document.getElementById('attendanceBulkActions');
        bulkActions.style.display = selectedCount > 0 ? 'flex' : 'none';
    }

    async applyBulkStatus() {
        const status = document.getElementById('bulkStatusSelect').value;
        if (!status) {
            this.showNotification('Please select a status to apply', 'warning');
            return;
        }

        try {
            const selectedRows = document.querySelectorAll('.student-select:checked');
            const updates = Array.from(selectedRows).map(checkbox => {
                const row = checkbox.closest('tr');
                const attendanceId = row.querySelector('.status-select').getAttribute('onchange').match(/'([^']+)'/)[1];
                return this.api.updateAttendance(attendanceId, { status });
            });

            await Promise.all(updates);
            this.showNotification('Attendance updated successfully', 'success');
            await this.loadAttendance(); // Reload to get fresh data
        } catch (error) {
            console.error('Error applying bulk status:', error);
            this.showNotification('Failed to update attendance', 'error');
        }
    }

    async markAllPresent() {
        try {
            const rows = document.querySelectorAll('#attendanceTableBody tr');
            const updates = Array.from(rows).map(row => {
                const attendanceId = row.querySelector('.status-select').getAttribute('onchange').match(/'([^']+)'/)[1];
                return this.api.updateAttendance(attendanceId, { status: 'present' });
            });

            await Promise.all(updates);
            this.showNotification('All students marked present', 'success');
            await this.loadAttendance(); // Reload to get fresh data
        } catch (error) {
            console.error('Error marking all present:', error);
            this.showNotification('Failed to update attendance', 'error');
        }
    }

    async exportAttendance() {
        try {
            const classId = document.getElementById('attendanceClass').value;
            const className = document.getElementById('attendanceClass').selectedOptions[0].text;
            const date = document.getElementById('attendanceDate').value;
            
            if (!classId || !date) {
                this.showNotification('Please select a class and date', 'warning');
                return;
            }

            const rows = Array.from(document.querySelectorAll('#attendanceTableBody tr')).map(row => ({
                'Student Name': row.cells[1].textContent,
                'Status': row.querySelector('.status-select').value,
                'Notes': row.querySelector('.notes-input').value
            }));

            // Create CSV content
            const headers = ['Student Name', 'Status', 'Notes'];
            const csvContent = [
                headers.join(','),
                ...rows.map(row => headers.map(header => `"${row[header]}"`).join(','))
            ].join('\n');

            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_${className}_${date}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showNotification('Attendance exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting attendance:', error);
            this.showNotification('Failed to export attendance', 'error');
        }
    }

    async viewAttendanceHistory(studentId) {
        try {
            const classId = document.getElementById('attendanceClass').value;
            if (!classId) {
                this.showNotification('Please select a class first', 'warning');
                return;
            }

            // Get student details and attendance history
            const [student, history] = await Promise.all([
                this.api.getStudent(studentId),
                this.api.getStudentAttendanceHistory(classId, studentId)
            ]);

            // Update modal content
            document.getElementById('attendanceHistoryStudentName').textContent = student.full_name;

            // Calculate statistics
            let present = 0, absent = 0, late = 0;
            history.forEach(record => {
                if (record.status === 'present') present++;
                else if (record.status === 'absent') absent++;
                else if (record.status === 'late') late++;
            });

            const total = history.length;
            const attendanceRate = total > 0 ? Math.round((present + (late * 0.5)) / total * 100) : 0;

            // Update statistics
            document.getElementById('historyPresentCount').textContent = present;
            document.getElementById('historyAbsentCount').textContent = absent;
            document.getElementById('historyLateCount').textContent = late;
            document.getElementById('historyAttendanceRate').textContent = `${attendanceRate}%`;

            // Update table
            const tableBody = document.getElementById('attendanceHistoryTableBody');
            tableBody.innerHTML = history.map(record => `
                <tr>
                    <td>${this.formatDate(record.date)}</td>
                    <td>
                        <span class="status-badge status-${record.status.toLowerCase()}">
                            ${record.status}
                        </span>
                    </td>
                    <td>${record.notes || ''}</td>
                </tr>
            `).join('');

            // Show modal
            this.showModal('viewAttendanceHistoryModal');
        } catch (error) {
            console.error('Error viewing attendance history:', error);
            this.showNotification('Failed to load attendance history', 'error');
        }
    }

    async loadGrades() {
        const classId = document.getElementById('gradesClass').value;
        const assignmentId = document.getElementById('gradesAssignment').value;

        if (!classId) {
            // Reset grade display if no class selected
            this.resetGradeStats();
            return;
        }

        try {
            // If class is selected but no assignment, load assignments for that class
            if (!assignmentId) {
                await this.loadAssignmentsForClass(classId);
                return;
            }

            // Get grades for the selected class and assignment
            const grades = await this.api.getGrades(classId, assignmentId);
            const students = await this.api.getClassStudents(classId);
            
            // Create a map of existing grades
            const gradeMap = new Map(grades.map(g => [g.student_id, g]));
            
            // Calculate statistics
            const validScores = grades.filter(g => g.score !== null).map(g => g.score);
            const averageGrade = validScores.length > 0 
                ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
                : 0;
            const submittedCount = grades.filter(g => g.score !== null).length;
            const pendingCount = students.length - submittedCount;
            const highestGrade = validScores.length > 0 ? Math.max(...validScores).toFixed(1) : 0;

            // Update statistics display
            this.updateGradeStats(averageGrade, submittedCount, pendingCount, highestGrade);

            // Generate table rows for all students
            const gradesTableBody = document.getElementById('gradesTableBody');
            if (!gradesTableBody) return;

            gradesTableBody.innerHTML = students.map(student => {
                const grade = gradeMap.get(student.id) || { score: null, status: 'pending' };
                return `
                    <tr>
                        <td>${student.full_name}</td>
                        <td>
                            <input type="number" 
                                   class="form-control grade-input" 
                                   value="${grade.score || ''}" 
                                   min="0" 
                                   max="100"
                                   onchange="window.teacherUI.updateGrade(${classId}, ${assignmentId}, ${student.id}, this.value)"
                                   placeholder="Enter grade">
                        </td>
                        <td>
                            <span class="status-badge ${grade.status || 'pending'}">
                                ${grade.status || 'Pending'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="window.teacherUI.addGradeComment(${classId}, ${assignmentId}, ${student.id})">
                                <i class="fas fa-comment"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading grades:', error);
            this.showNotification('Failed to load grades', 'error');
        }
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

    updateGradeStats(average, submitted, pending, highest) {
        const stats = {
            'averageGrade': average + '%',
            'submittedCount': submitted,
            'pendingCount': pending,
            'highestGrade': highest + '%'
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async updateGrade(classId, assignmentId, studentId, score) {
        try {
            await this.api.updateGrade(classId, assignmentId, studentId, parseFloat(score));
            this.showNotification('Grade updated successfully', 'success');
            await this.loadGrades(); // Reload to update statistics
        } catch (error) {
            console.error('Error updating grade:', error);
            this.showNotification('Error updating grade', 'error');
        }
    }

    async loadAssignmentsForClass(classId) {
        try {
            const assignments = await this.api.getClassAssignments(classId);
            const select = document.getElementById('gradesAssignment');
            
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

    getGradeStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'submitted': return 'submitted';
            case 'graded': return 'graded';
            default: return 'pending';
        }
    }

    async addGradeComment(classId, assignmentId, studentId) {
        const modal = document.getElementById('addCommentModal');
        const commentForm = document.getElementById('addCommentForm');
        
        modal.dataset.classId = classId;
        modal.dataset.assignmentId = assignmentId;
        modal.dataset.studentId = studentId;
        commentForm.reset();
        this.showModal('addCommentModal');
    }

    async saveComment() {
        const modal = document.getElementById('addCommentModal');
        const classId = modal.dataset.classId;
        const assignmentId = modal.dataset.assignmentId;
        const studentId = modal.dataset.studentId;
        const comment = document.getElementById('gradeComment').value;

        try {
            await this.api.updateGrade(classId, assignmentId, studentId, null, comment);
            this.showNotification('Comment added successfully', 'success');
            this.closeModal('addCommentModal');
            await this.loadGrades();
        } catch (error) {
            console.error('Error adding comment:', error);
            this.showNotification('Error adding comment', 'error');
        }
    }

    // Helper methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getActivityIcon(type) {
        const icons = {
            class: 'chalkboard-teacher',
            assignment: 'tasks',
            attendance: 'user-check',
            grade: 'star',
            default: 'bell'
        };
        return icons[type] || icons.default;
    }

    showNotification(title, message, type = 'info') {
        // Use the global notification function
        window.showNotification(title, message);
    }

    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = './login.html';
    }

    async viewClass(classId) {
        try {
            const [classData, students, assignments, stats] = await Promise.all([
                this.api.getClass(classId),
                this.api.getClassStudents(classId),
                this.api.getAssignments(),
                this.api.getClassStats(classId)
            ]);

            // Create modal HTML
            const modalHtml = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${classData.name}</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="class-info">
                            <div class="info-group">
                                <label>Grade & Section:</label>
                                <p>${classData.grade}${classData.section}</p>
                            </div>
                            <div class="info-group">
                                <label>Room:</label>
                                <p>${classData.room || 'Not assigned'}</p>
                            </div>
                            <div class="info-group">
                                <label>Schedule:</label>
                                <p>${classData.schedule || 'Not set'}</p>
                            </div>
                            <div class="info-group">
                                <label>Students:</label>
                                <p>${classData.current_students}/${classData.capacity}</p>
                            </div>
                            <div class="info-group">
                                <label>Subject:</label>
                                <p>${classData.subject || 'Not specified'}</p>
                            </div>
                            ${classData.description ? `
                            <div class="info-group">
                                <label>Description:</label>
                                <p>${classData.description}</p>
                            </div>
                            ` : ''}
                        </div>

                        <div class="class-stats">
                            <div class="stat-item">
                                <div class="stat-value">${stats.active_assignments}</div>
                                <div class="stat-label">Active Assignments</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.completed_assignments}</div>
                                <div class="stat-label">Completed Assignments</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.average_grade}%</div>
                                <div class="stat-label">Average Grade</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${students.length}</div>
                                <div class="stat-label">Enrolled Students</div>
                            </div>
                        </div>

                        <div class="assignments-section">
                            <h3>Class Assignments</h3>
                            ${assignments.length > 0 ? `
                                <div class="assignments-list">
                                    ${assignments.filter(a => a.class_id === classId).map(assignment => `
                                        <div class="assignment-item">
                                            <div class="assignment-header">
                                                <div class="assignment-title">${assignment.title}</div>
                                                <span class="status-badge status-${assignment.status.toLowerCase()}">${assignment.status}</span>
                                            </div>
                                            <div class="assignment-details">
                                                <div class="due-date">
                                                    <i class="fas fa-calendar"></i>
                                                    Due: ${this.formatDate(assignment.due_date)}
                                                </div>
                                                <div class="submission-stats">
                                                    <i class="fas fa-file-alt"></i>
                                                    Submissions: ${assignment.submission_stats.total_submissions} / ${assignment.total_students}
                                                </div>
                                            </div>
                                            <div class="assignment-actions">
                                                <button class="btn btn-sm btn-view" onclick="window.teacherUI.viewAssignment(${assignment.id})">
                                                    <i class="fas fa-eye"></i> View
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="no-data">No assignments yet</p>'}
                        </div>

                        <div class="student-list">
                            <h3>Enrolled Students (${students.length})</h3>
                            ${students.length > 0 ? `
                                <div class="student-grid">
                                    ${students.map(student => `
                                        <div class="student-item">
                                            <div class="student-info">
                                                <span class="student-name">${student.full_name}</span>
                                                <span class="student-email">${student.email}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="no-data">No students enrolled yet</p>'}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="teacherUI.closeModal('viewClassModal')">Close</button>
                    </div>
                </div>
            `;

            // Create or update modal
            let modal = document.getElementById('viewClassModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'viewClassModal';
                modal.className = 'modal';
                document.body.appendChild(modal);
            }
            modal.innerHTML = modalHtml;

            // Show modal
            this.showModal('viewClassModal');

            // Add event listener for clicking outside modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal('viewClassModal');
                }
            });
        } catch (error) {
            console.error('Error viewing class:', error);
            this.showNotification('Error loading class details', 'error');
        }
    }

    showModal(modalId) {
        const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Add event listeners for closing
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modal));
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        }
    }

    closeModal(modalId) {
        const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    async viewAssignment(assignmentId) {
        try {
            console.log(`Attempting to view assignment ${assignmentId}`);
            let assignment, submissions;
            
            try {
                assignment = await this.api.getAssignment(assignmentId);
                console.log('Assignment data received:', assignment);
            } catch (error) {
                console.error(`Error fetching assignment ${assignmentId}:`, error);
                this.showNotification(`Error loading assignment: ${error.message}`, 'error');
                return;
            }
            
            try {
                submissions = await this.api.getAssignmentSubmissions(assignmentId);
                console.log('Submissions data received:', submissions);
            } catch (error) {
                console.warn(`Error fetching submissions for assignment ${assignmentId}:`, error);
                submissions = [];
            }

            // Get or create modal
            let modal = document.getElementById('viewAssignmentModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'viewAssignmentModal';
                modal.className = 'modal';
                document.body.appendChild(modal);
            }
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Assignment Details</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="assignment-info">
                            <div class="info-group">
                                <label>Title:</label>
                                <p>${assignment.title || 'No title'}</p>
                            </div>
                            <div class="info-group">
                                <label>Description:</label>
                                <p>${assignment.description || 'No description'}</p>
                            </div>
                            <div class="info-group">
                                <label>Due Date:</label>
                                <p>${assignment.due_date ? this.formatDate(assignment.due_date) : 'Not set'}</p>
                            </div>
                            <div class="info-group">
                                <label>Status:</label>
                                <p><span class="status-badge status-${(assignment.status || 'unknown').toLowerCase()}">${assignment.status || 'Unknown'}</span></p>
                            </div>
                            <div class="info-group">
                                <label>Class:</label>
                                <p>${assignment.class_name || 'Unknown Class'}</p>
                            </div>
                        </div>
                        
                        <div class="submissions-section">
                            <h3>Submissions (${submissions ? submissions.length : 0})</h3>
                            <div class="submissions-list">
                                ${(submissions && submissions.length > 0) ? submissions.map(sub => `
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
                                `).join('') : '<p class="no-data">No submissions yet</p>'}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.teacherUI.closeModal('viewAssignmentModal')">Close</button>
                        <button class="btn btn-primary" onclick="window.teacherUI.editAssignment(${assignmentId})">Edit</button>
                    </div>
                </div>
            `;

            // Show modal
            modal.style.display = 'block';

            // Add event listeners
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal('viewAssignmentModal'));
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal('viewAssignmentModal');
                }
            });

        } catch (error) {
            console.error('Error viewing assignment:', error);
            this.showNotification('Error viewing assignment details', 'error');
        }
    }

    async viewFileContent(filePath) {
        try {
            const response = await fetch(`/uploads/assignments/${filePath}`);
            const content = await response.text();
            
            const modal = document.createElement('div');
            modal.id = 'viewFileModal';
            modal.className = 'modal dynamic-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>File Content: ${filePath.split('/').pop()}</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="file-content">
                            <pre class="content-preview">${content}</pre>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="teacherUI.closeModal('viewFileModal')">Close</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            this.showModal('viewFileModal');

            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal);
            });
        } catch (error) {
            console.error('Error viewing file content:', error);
            this.showNotification('Error loading file content', 'error');
        }
    }

    async editAssignment(assignmentId) {
        try {
            console.log(`Attempting to edit assignment ${assignmentId}`);
            
            // Try to get assignment data
            let assignment;
            try {
                assignment = await this.api.getAssignment(assignmentId);
                console.log('Assignment data received for editing:', assignment);
            } catch (error) {
                console.error(`Error fetching assignment ${assignmentId} for editing:`, error);
                this.showNotification(`Error loading assignment: ${error.message}`, 'error');
                return;
            }
            
            // Load classes for the dropdown
            let classes;
            try {
                classes = await this.api.getClasses();
                console.log('Classes for dropdown:', classes);
            } catch (error) {
                console.warn('Error fetching classes:', error);
                classes = [];
            }
            
            // Update form fields
            document.getElementById('editAssignmentId').value = assignment.id;
            document.getElementById('editAssignmentTitle').value = assignment.title || '';
            document.getElementById('editAssignmentDescription').value = assignment.description || '';
            
            // Format the due date
            let dueDateValue = '';
            if (assignment.due_date) {
                if (assignment.due_date.includes('T')) {
                    dueDateValue = assignment.due_date.split('T')[0];
                } else {
                    dueDateValue = assignment.due_date;
                }
            }
            document.getElementById('editAssignmentDueDate').value = dueDateValue;
            
            // Set up the class dropdown
            const classSelect = document.getElementById('editAssignmentClass');
            if (classes && classes.length > 0) {
                classSelect.innerHTML = `
                    <option value="">Select Class</option>
                    ${classes.map(c => `<option value="${c.id}" ${c.id === assignment.class_id ? 'selected' : ''}>${c.name} - ${c.grade}${c.section}</option>`).join('')}
                `;
            } else {
                classSelect.innerHTML = `
                    <option value="${assignment.class_id}" selected>Current Class (ID: ${assignment.class_id})</option>
                `;
            }
            
            // Set the max score
            document.getElementById('editAssignmentMaxScore').value = assignment.max_score || 100;
            
            // Set the status
            const statusSelect = document.getElementById('editAssignmentStatus');
            statusSelect.value = assignment.status || 'Active';
            
            // Show the modal
            this.showModal('editAssignmentModal');
        } catch (error) {
            console.error('Error loading assignment for edit:', error);
            this.showNotification('Error loading assignment for editing', 'error');
        }
    }

    async deleteAssignment(assignmentId) {
        if (!confirm('Are you sure you want to delete this assignment?')) {
            return;
        }

        try {
            await this.api.deleteAssignment(assignmentId);
            this.showNotification('Assignment deleted successfully', 'success');
            await this.loadAssignments();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            this.showNotification('Error deleting assignment', 'error');
        }
    }

    async createAssignment() {
        try {
            console.log("Opening create assignment modal");
            // Clear form fields
            document.getElementById('createAssignmentForm').reset();
            
            // Load classes into select dropdown
            const classSelect = document.getElementById('assignmentClass');
            const classes = await this.api.getClasses();
            
            if (classes && classes.length > 0) {
                classSelect.innerHTML = `
                    <option value="">Select a class</option>
                    ${classes.map(c => `<option value="${c.id}">${c.name} - ${c.grade}${c.section}</option>`).join('')}
                `;
            } else {
                console.warn("No classes found for assignment creation");
                classSelect.innerHTML = `<option value="">No classes available</option>`;
            }
            
            // Set default due date to 7 days from now
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);
            const dueDateFormatted = dueDate.toISOString().split('T')[0];
            document.getElementById('assignmentDueDate').value = dueDateFormatted;
            
            // Show the modal
            this.showModal('createAssignmentModal');
        } catch (error) {
            console.error("Error preparing assignment creation form:", error);
            this.showNotification("Error loading class list", "error");
        }
    }

    async saveAssignment() {
        const form = document.getElementById('createAssignmentForm');
        const data = {
            title: document.getElementById('assignmentTitle').value.trim(),
            description: document.getElementById('assignmentDescription').value.trim(),
            due_date: document.getElementById('assignmentDueDate').value,
            class_id: parseInt(document.getElementById('assignmentClass').value),
            max_score: parseFloat(document.getElementById('assignmentMaxScore').value) || 100
        };

        // Validate required fields
        if (!data.title || !data.description || !data.due_date || !data.class_id) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Format due_date to ensure it's in a proper date format (YYYY-MM-DD)
        try {
            // Extract just the date part if it's a datetime-local
            if (data.due_date.includes('T')) {
                const dueDateObj = new Date(data.due_date);
                data.due_date = dueDateObj.toISOString().split('T')[0];
            }

            console.log('Submitting assignment with data:', data);
            
            const response = await this.api.createAssignment(data);
            this.showNotification('Assignment created successfully', 'success');
            this.closeModal('createAssignmentModal');
            await this.loadAssignments();
        } catch (error) {
            console.error('Error creating assignment:', error);
            let errorMessage = 'Error creating assignment';
            if (error.message) {
                errorMessage += ': ' + error.message;
            }
            this.showNotification(errorMessage, 'error');
        }
    }

    async saveEditedAssignment() {
        const assignmentId = document.getElementById('editAssignmentId').value;
        const data = {
            title: document.getElementById('editAssignmentTitle').value.trim(),
            description: document.getElementById('editAssignmentDescription').value.trim(),
            due_date: document.getElementById('editAssignmentDueDate').value,
            class_id: parseInt(document.getElementById('editAssignmentClass').value)
        };

        // Validate required fields
        if (!data.title || !data.description || !data.due_date || !data.class_id) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            await this.api.updateAssignment(assignmentId, data);
            this.showNotification('Assignment updated successfully', 'success');
            this.closeModal('editAssignmentModal');
            await this.loadAssignments();
        } catch (error) {
            console.error('Error updating assignment:', error);
            this.showNotification('Error updating assignment', 'error');
        }
    }

    async handleAssignmentSubmission(assignmentId, files, notes) {
        try {
            if (this.isSubmittingAssignment) {
                this.showNotification('Another submission is in progress', 'warning');
                return;
            }

            this.isSubmittingAssignment = true;
            this.showNotification('Uploading submission...', 'info');

            const formData = new FormData();
            for (let file of files) {
                formData.append('files', file);
            }
            if (notes) {
                formData.append('notes', notes);
            }

            const response = await this.api.submitAssignment(assignmentId, formData);

            if (response.success) {
                this.showNotification('Assignment submitted successfully', 'success');
                await this.loadAssignments();  // Refresh assignments list
            } else {
                throw new Error(response.message || 'Failed to submit assignment');
            }

        } catch (error) {
            console.error('Error submitting assignment:', error);
            this.showNotification('Error submitting assignment: ' + error.message, 'error');
        } finally {
            this.isSubmittingAssignment = false;
        }
    }

    async viewSubmission(submissionId) {
        try {
            const submission = await this.api.getSubmission(submissionId);
            
            // Update submission modal content
            const modal = document.getElementById('viewSubmissionModal');
            if (!modal) return;

            const studentName = modal.querySelector('#submissionStudentName');
            const submissionDate = modal.querySelector('#submissionDate');
            const submissionStatus = modal.querySelector('#submissionStatus');
            const submissionScore = modal.querySelector('#submissionScore');
            const submissionFeedback = modal.querySelector('#submissionFeedback');
            const fileLink = modal.querySelector('#submissionFileLink');

            if (studentName) studentName.textContent = submission.student_name;
            if (submissionDate) submissionDate.textContent = this.formatDate(submission.submission_date);
            if (submissionStatus) submissionStatus.textContent = submission.status;
            if (submissionScore) submissionScore.value = submission.score || '';
            if (submissionFeedback) submissionFeedback.value = submission.feedback || '';
            if (fileLink && submission.file_path) {
                fileLink.href = submission.file_path;
                fileLink.textContent = submission.file_path.split('/').pop();
            }

            // Show the modal
            this.showModal('viewSubmissionModal');

            // Add event listener for saving changes
            const saveBtn = modal.querySelector('.btn-primary');
            if (saveBtn) {
                saveBtn.onclick = async () => {
                    await this.updateSubmission(submissionId, {
                        score: submissionScore.value,
                        feedback: submissionFeedback.value
                    });
                };
            }

        } catch (error) {
            console.error('Error viewing submission:', error);
            this.showNotification('Error loading submission details: ' + error.message, 'error');
        }
    }

    async updateSubmission(submissionId, data) {
        try {
            const response = await this.api.updateSubmission(submissionId, data);
            
            if (response.success) {
                this.showNotification('Submission updated successfully', 'success');
                this.closeModal('viewSubmissionModal');
                await this.loadAssignments();  // Refresh assignments list
            } else {
                throw new Error(response.message || 'Failed to update submission');
            }

        } catch (error) {
            console.error('Error updating submission:', error);
            this.showNotification('Error updating submission: ' + error.message, 'error');
        }
    }
}
=======
            `;
        }).join('');
    },

    loadGradesData() {
        const classId = document.getElementById('gradesClass').value;
        const tableBody = document.getElementById('gradesTableBody');
        
        if (!classId || !tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" class="no-data">Select a class to view grades</td></tr>';
            return;
        }

        const studentsInClass = mockData.students.filter(student => student.grade === classId.replace('Class ', ''));
        const relevantAssignments = mockData.assignments.filter(a => a.class === classId.replace('Class ', ''));

        tableBody.innerHTML = studentsInClass.map(student => {
            const studentGrades = mockData.assignments.filter(a => a.id === student.id);
            const average = studentGrades.reduce((acc, curr) => acc + curr.submissions, 0) / studentGrades.length || 0;

            return `
                <tr>
                    <td>${student.name}</td>
                    <td>${average.toFixed(1)}%</td>
                    <td>
                        ${relevantAssignments.map(assignment => {
                            const grade = studentGrades.find(g => g.id === assignment.id);
                            return `
                                <div class="grade-item">
                                    <span class="assignment-name">${assignment.title}:</span>
                                    <input type="number" min="0" max="100" value="${grade?.submissions || ''}"
                                        onchange="TeacherUI.updateGrade(${student.id}, ${assignment.id}, this.value)">
                                </div>
                            `;
                        }).join('')}
                    </td>
                    <td>
                        <button class="btn btn-small" onclick="TeacherUI.viewStudentGrades(${student.id})">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Modal handling methods
    showCreateAssignmentModal(classId = null) {
        const modalContent = `
            <div class="modal-header">
                <h2>Create New Assignment</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="createAssignmentForm">
                    <div class="form-group">
                        <label for="assignmentTitle">Title</label>
                        <input type="text" id="assignmentTitle" required>
                    </div>
                    <div class="form-group">
                        <label for="assignmentClass">Class</label>
                        <select id="assignmentClass" required>
                            ${mockData.classes.map(cls => 
                                `<option value="${cls.name}" ${cls.name === classId ? 'selected' : ''}>${cls.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="assignmentDescription">Description</label>
                        <textarea id="assignmentDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="assignmentDueDate">Due Date</label>
                        <input type="date" id="assignmentDueDate" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="Modal.hide('assignmentModal')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Assignment</button>
                    </div>
                </form>
            </div>
        `;

        const modal = document.getElementById('assignmentModal');
        modal.innerHTML = modalContent;
        
        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => this.handleCreateAssignment(e));
        
        Modal.show('assignmentModal');
    },

    handleCreateAssignment(event) {
        event.preventDefault();
        const form = event.target;
        const { isValid, errors } = FormValidator.validateForm(form);

        if (!isValid) {
            Utils.showNotification(errors.join('\n'), 'error');
            return;
        }

        const newAssignment = {
            id: mockData.assignments.length + 1,
            title: form.querySelector('#assignmentTitle').value,
            class: form.querySelector('#assignmentClass').value,
            description: form.querySelector('#assignmentDescription').value,
            dueDate: form.querySelector('#assignmentDueDate').value,
            status: 'Active'
        };

        mockData.assignments.push(newAssignment);
        Utils.showNotification('Assignment created successfully');
        Modal.hide('assignmentModal');
        this.loadAssignments();
        this.loadPendingTasks();
    },

    // Other UI methods...
    viewClass(className) {
        // Implementation for viewing class details
    },

    viewAssignment(id) {
        // Implementation for viewing assignment details
    },

    editAssignment(id) {
        // Implementation for editing assignment
    },

    deleteAssignment(id) {
        // Implementation for deleting assignment
    },

    updateAttendance(studentId, status) {
        // Implementation for updating attendance
    },

    updateAttendanceNotes(studentId, notes) {
        // Implementation for updating attendance notes
    },

    updateGrade(studentId, assignmentId, grade) {
        // Implementation for updating grades
    },

    viewStudentAttendance(studentId) {
        // Implementation for viewing student attendance history
    },

    viewStudentGrades(studentId) {
        // Implementation for viewing student grade history
    }
}; 
>>>>>>> bd2aa6b26b1b74a5ce711fbbdce6b42612ef8105
