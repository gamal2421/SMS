// Mock Data
const mockData = {
    currentUser: {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@school.com',
        phone: '+1 234 567 8900',
        subjects: ['Mathematics', 'Physics'],
        qualification: 'M.Sc. Mathematics',
        role: 'teacher'
    },
    stats: {
        totalClasses: 5,
        totalStudents: 150,
        totalAssignments: 12,
        attendanceRate: 95
    },
    schedule: [
        { time: '09:00 AM - 10:30 AM', class: 'Grade 10-A', subject: 'Mathematics', room: 'Room 101' },
        { time: '11:00 AM - 12:30 PM', class: 'Grade 11-B', subject: 'Physics', room: 'Lab 2' },
        { time: '02:00 PM - 03:30 PM', class: 'Grade 10-B', subject: 'Mathematics', room: 'Room 103' }
    ],
    classes: [
        { id: '1', name: 'Grade 10-A', subject: 'Mathematics', students: 32, schedule: 'Mon, Wed 9:00 AM', room: '101' },
        { id: '2', name: 'Grade 11-B', subject: 'Physics', students: 28, schedule: 'Mon, Wed 11:00 AM', room: 'Lab 2' },
        { id: '3', name: 'Grade 10-B', subject: 'Mathematics', students: 30, schedule: 'Mon, Wed 2:00 PM', room: '103' },
        { id: '4', name: 'Grade 11-A', subject: 'Physics', students: 31, schedule: 'Tue, Thu 10:00 AM', room: 'Lab 1' },
        { id: '5', name: 'Grade 10-C', subject: 'Mathematics', students: 29, schedule: 'Tue, Thu 2:00 PM', room: '102' }
    ],
    students: [
        { id: '1', name: 'Alice Johnson', grade: '10-A', attendance: '95%', performance: '88%' },
        { id: '2', name: 'Bob Smith', grade: '10-A', attendance: '92%', performance: '85%' },
        { id: '3', name: 'Carol White', grade: '11-B', attendance: '98%', performance: '92%' },
        // Add more students as needed
    ],
    assignments: [
        { 
            id: '1', 
            title: 'Quadratic Equations', 
            class: 'Grade 10-A',
            dueDate: '2024-03-15',
            status: 'Active',
            submissions: 28,
            totalStudents: 32
        },
        { 
            id: '2', 
            title: 'Newton\'s Laws', 
            class: 'Grade 11-B',
            dueDate: '2024-03-20',
            status: 'Active',
            submissions: 25,
            totalStudents: 28
        }
    ]
};

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

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
            });
        });

        // Logout button
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
                            <i class="fas fa-history"></i>
                        </button>
                    </td>
                </tr>
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