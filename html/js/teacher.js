// Mock Data
const mockTeacherData = {
    id: 1,
    name: "John Smith",
    email: "john.smith@school.edu",
    subject: "Mathematics",
    classes: ["Class 10A", "Class 11B", "Class 9C"],
    schedule: [
        { time: "08:00 AM", class: "Class 10A", subject: "Mathematics", room: "Room 101" },
        { time: "10:00 AM", class: "Class 11B", subject: "Mathematics", room: "Room 203" },
        { time: "02:00 PM", class: "Class 9C", subject: "Mathematics", room: "Room 105" }
    ]
};

const mockStudents = [
    { id: 1, name: "Alice Johnson", class: "10A" },
    { id: 2, name: "Bob Wilson", class: "10A" },
    { id: 3, name: "Carol Smith", class: "11B" },
    // Add more mock students as needed
];

const mockAssignments = [
    {
        id: 1,
        title: "Quadratic Equations",
        description: "Solve the given set of quadratic equations",
        dueDate: "2024-03-20",
        class: "10A",
        status: "pending"
    },
    // Add more mock assignments as needed
];

// Add more mock data for complete functionality
const mockGrades = [
    { studentId: 1, assignmentId: 1, grade: 85, submissionDate: '2024-03-15' },
    { studentId: 2, assignmentId: 1, grade: 92, submissionDate: '2024-03-14' },
    { studentId: 3, assignmentId: 1, grade: 78, submissionDate: '2024-03-15' }
];

const mockAttendance = {
    '2024-03-18': {
        'Class 10A': [
            { studentId: 1, status: 'present', notes: '' },
            { studentId: 2, status: 'absent', notes: 'Parent informed' },
            { studentId: 3, status: 'late', notes: '15 minutes' }
        ]
    }
};

// DOM Elements
let currentTab = 'dashboard';
let currentModal = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeHeader();
    initializeDashboard();
    updateButtonAttributes();
    setupEventListeners();
    loadTeacherProfile();
    addActionButtons();
});

// Event Listeners Setup
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Form submissions
    setupFormListeners();
    
    // Modal handlers
    setupModalListeners();

    // Add click handlers for buttons that use onclick in HTML
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
}

// Tab Management
function switchTab(tabId) {
    // Update current tab
    currentTab = tabId;
    
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const selectedContent = document.getElementById(`${tabId}-section`);
    if (selectedContent) {
        selectedContent.classList.add('active');
        
        // Load content based on tab
        switch(tabId) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'classes':
                loadClasses();
                break;
            case 'assignments':
                loadAssignments();
                break;
            case 'attendance':
                loadAttendance();
                break;
            case 'grades':
                loadGrades();
                break;
            case 'profile':
                loadProfile();
                break;
        }
    }
}

// Dashboard Functions
function initializeDashboard() {
    loadDashboard();
}

function loadDashboard() {
    updateSchedule();
    updateStats();
    updateRecentActivities();
}

function updateSchedule() {
    const scheduleList = document.querySelector('.schedule-list');
    if (!scheduleList) return;

    scheduleList.innerHTML = mockTeacherData.schedule.map(item => `
        <div class="schedule-item">
            <span class="schedule-time">${item.time}</span>
            <div class="schedule-details">
                <div class="schedule-class">${item.class}</div>
                <div class="schedule-room">${item.room}</div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    // Update dashboard statistics
    document.getElementById('totalClasses').textContent = mockTeacherData.classes.length;
    document.getElementById('totalStudents').textContent = mockStudents.length;
    document.getElementById('totalAssignments').textContent = mockAssignments.length;
    document.getElementById('avgAttendance').textContent = '92%';
}

function updateRecentActivities() {
    const recentActivitiesContainer = document.querySelector('.recent-activities');
    if (!recentActivitiesContainer) return;

    // Combine and sort all activities by date
    const activities = [
        ...mockGrades.map(grade => ({
            type: 'grade',
            date: grade.submissionDate,
            description: `Graded ${mockStudents.find(s => s.id === grade.studentId)?.name}'s assignment`
        })),
        ...Object.entries(mockAttendance).flatMap(([date, classes]) => 
            Object.entries(classes).map(([className, records]) => ({
                type: 'attendance',
                date: date,
                description: `Marked attendance for ${className}`
            }))
        ),
        ...mockAssignments.map(assignment => ({
            type: 'assignment',
            date: assignment.dueDate,
            description: `Created assignment: ${assignment.title}`
        }))
    ];

    // Sort activities by date in descending order
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display only the 5 most recent activities
    const recentActivitiesHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-description">${activity.description}</div>
                <div class="activity-date">${formatDate(activity.date)}</div>
            </div>
        </div>
    `).join('');

    recentActivitiesContainer.innerHTML = recentActivitiesHTML;
}

function getActivityIcon(type) {
    switch(type) {
        case 'grade': return 'fa-star';
        case 'attendance': return 'fa-user-check';
        case 'assignment': return 'fa-book';
        default: return 'fa-bell';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

// Classes Management
function loadClasses() {
    const classesTableBody = document.getElementById('classesTableBody');
    if (!classesTableBody) return;

    classesTableBody.innerHTML = mockTeacherData.classes.map(className => `
        <tr>
            <td>${className}</td>
            <td>${className.split(' ')[1]}</td>
            <td>${mockStudents.filter(student => student.class === className.split(' ')[1]).length} students</td>
            <td>Mon, Wed, Fri</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewClass('${className}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editClass('${className}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Assignments Management
function loadAssignments() {
    const assignmentsTableBody = document.getElementById('assignmentsTableBody');
    if (!assignmentsTableBody) return;

    assignmentsTableBody.innerHTML = mockAssignments.map(assignment => `
        <tr>
            <td>${assignment.title}</td>
            <td>${assignment.class}</td>
            <td>${formatDate(assignment.dueDate)}</td>
            <td><span class="status-badge status-${assignment.status}">${assignment.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" data-action="edit-assignment" data-id="${assignment.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete-assignment" data-id="${assignment.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Add event listeners for edit and delete buttons
    assignmentsTableBody.querySelectorAll('[data-action="edit-assignment"]').forEach(button => {
        button.addEventListener('click', () => editAssignment(parseInt(button.dataset.id)));
    });

    assignmentsTableBody.querySelectorAll('[data-action="delete-assignment"]').forEach(button => {
        button.addEventListener('click', () => deleteAssignment(parseInt(button.dataset.id)));
    });
}

function editAssignment(id) {
    const assignment = mockAssignments.find(a => a.id === id);
    if (!assignment) {
        showNotification('Assignment not found', 'error');
        return;
    }

    let modal = document.getElementById('editAssignmentModal');
    if (!modal) {
        modal = createEditAssignmentModal();
        document.body.appendChild(modal);
    }

    // Populate form with assignment data
    document.getElementById('editAssignmentId').value = assignment.id;
    document.getElementById('editAssignmentTitle').value = assignment.title;
    document.getElementById('editAssignmentClass').value = assignment.class;
    document.getElementById('editAssignmentDescription').value = assignment.description;
    document.getElementById('editAssignmentDueDate').value = assignment.dueDate;
    document.getElementById('editAssignmentStatus').value = assignment.status;

    showModal('editAssignmentModal');
}

function createEditAssignmentModal() {
    const modal = document.createElement('div');
    modal.id = 'editAssignmentModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Assignment</h2>
                <span class="close-modal" data-action="cancel">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editAssignmentForm" onsubmit="handleEditAssignment(event)">
                    <input type="hidden" id="editAssignmentId">
                    <div class="form-section">
                        <div class="form-section-title">Assignment Details</div>
                        <div class="form-grid">
                            <div class="form-group floating">
                                <input type="text" id="editAssignmentTitle" required placeholder=" ">
                                <label for="editAssignmentTitle">Title</label>
                            </div>
                            <div class="form-group">
                                <label for="editAssignmentClass">Class</label>
                                <select id="editAssignmentClass" required>
                                    ${mockTeacherData.classes.map(className => 
                                        `<option value="${className.split(' ')[1]}">${className}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="editAssignmentDescription">Description</label>
                            <textarea id="editAssignmentDescription" required placeholder="Enter assignment description..."></textarea>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editAssignmentDueDate">Due Date</label>
                                <input type="date" id="editAssignmentDueDate" required>
                            </div>
                            <div class="form-group">
                                <label for="editAssignmentStatus">Status</label>
                                <select id="editAssignmentStatus" required>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    return modal;
}

function handleEditAssignment(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('editAssignmentId').value);
    const title = document.getElementById('editAssignmentTitle').value;
    const className = document.getElementById('editAssignmentClass').value;
    const description = document.getElementById('editAssignmentDescription').value;
    const dueDate = document.getElementById('editAssignmentDueDate').value;
    const status = document.getElementById('editAssignmentStatus').value;

    const assignmentIndex = mockAssignments.findIndex(a => a.id === id);
    if (assignmentIndex === -1) {
        showNotification('Assignment not found', 'error');
        return;
    }

    // Update assignment
    mockAssignments[assignmentIndex] = {
        ...mockAssignments[assignmentIndex],
        title,
        class: className,
        description,
        dueDate,
        status
    };

    loadAssignments();
    hideModal();
    showNotification('Assignment updated successfully');
}

function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        const index = mockAssignments.findIndex(a => a.id === id);
        if (index !== -1) {
            mockAssignments.splice(index, 1);
            loadAssignments();
            showNotification('Assignment deleted successfully');
        } else {
            showNotification('Assignment not found', 'error');
        }
    }
}

// Attendance Management
function loadAttendance() {
    // Populate class select
    const classSelect = document.getElementById('attendanceClass');
    if (classSelect) {
        classSelect.innerHTML = `
            <option value="">Select Class</option>
            ${mockTeacherData.classes.map(className => 
                `<option value="${className}">${className}</option>`
            ).join('')}
        `;
    }

    // Set today's date
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Clear attendance table
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    if (attendanceTableBody) {
        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">Select a class to view attendance</td>
            </tr>
        `;
    }
}

// Grades Management
function loadGrades() {
    // Populate class select
    const classSelect = document.getElementById('gradesClass');
    if (classSelect) {
        classSelect.innerHTML = `
            <option value="">Select Class</option>
            ${mockTeacherData.classes.map(className => 
                `<option value="${className}">${className}</option>`
            ).join('')}
        `;
    }

    // Clear grades table
    const gradesTableBody = document.getElementById('gradesTableBody');
    if (gradesTableBody) {
        gradesTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">Select a class and assignment to view grades</td>
            </tr>
        `;
    }
}

// Profile Management
function loadTeacherProfile() {
    const profileSection = document.getElementById('profile-section');
    if (!profileSection) return;

    profileSection.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar" id="profileAvatar">${getInitials(mockTeacherData.name)}</div>
                <div class="profile-info">
                    <h2 id="profileName">${mockTeacherData.name}</h2>
                    <p id="profileEmail">${mockTeacherData.email}</p>
                    <p id="profileSubject">Subject: ${mockTeacherData.subject}</p>
                </div>
                <button class="btn btn-primary" data-action="edit-profile">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
            </div>
            <div class="profile-details">
                <div class="profile-section">
                    <h3>Teaching Schedule</h3>
                    <div class="schedule-list">
                        ${mockTeacherData.schedule.map(item => `
                            <div class="schedule-item">
                                <span class="schedule-time">${item.time}</span>
                                <div class="schedule-details">
                                    <div class="schedule-class">${item.class}</div>
                                    <div class="schedule-room">${item.room}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Utility Functions
function getInitials(name) {
    return name.split(' ').map(word => word[0]).join('');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Modal Management
function hideModal() {
    if (currentModal) {
        currentModal.style.display = 'none';
        // Remove event listeners to prevent memory leaks
        const cancelButtons = currentModal.querySelectorAll('[data-action="cancel"], .close-modal');
        cancelButtons.forEach(button => {
            button.removeEventListener('click', handleCancel);
        });
        currentModal.removeEventListener('click', handleModalOutsideClick);
        currentModal = null;
    }
}

function handleModalOutsideClick(e) {
    if (e.target === currentModal) {
        handleCancel(e);
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Add event listeners for cancel buttons
    const cancelButtons = modal.querySelectorAll('[data-action="cancel"], .close-modal');
    cancelButtons.forEach(button => {
        // Remove existing listeners to prevent duplicates
        button.removeEventListener('click', handleCancel);
        // Add new listener
        button.addEventListener('click', handleCancel);
    });
    
    // Add click outside modal to close
    modal.removeEventListener('click', handleModalOutsideClick);
    modal.addEventListener('click', handleModalOutsideClick);
    
    modal.style.display = 'block';
    currentModal = modal;
}

function handleCancel(event) {
    event.preventDefault();
    const modal = event.target.closest('.modal');
    if (modal) {
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        hideModal();
    }
}

// Update setupModalListeners to use new modal management
function setupModalListeners() {
    // Initial setup of any existing modals
    document.querySelectorAll('.modal').forEach(modal => {
        const cancelButtons = modal.querySelectorAll('[data-action="cancel"], .close-modal');
        cancelButtons.forEach(button => {
            button.removeEventListener('click', handleCancel);
            button.addEventListener('click', handleCancel);
        });
    });
}

// Form Handlers
function setupFormListeners() {
    // Assignment form
    const assignmentForm = document.getElementById('createAssignmentForm');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Handle assignment submission
            const formData = new FormData(assignmentForm);
            // Add to mockAssignments or send to backend
            showNotification('Assignment created successfully');
            hideModal();
            loadAssignments(); // Refresh assignments list
        });
    }
}

// Action Handlers
function viewClass(className) {
    let modal = document.getElementById('viewClassModal');
    if (!modal) {
        modal = createViewClassModal();
        document.body.appendChild(modal);
    }

    const students = mockStudents.filter(student => student.class === className.split(' ')[1]);
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <h3>Class Details: ${className}</h3>
        <div class="class-stats">
            <div>Total Students: ${students.length}</div>
            <div>Average Attendance: ${calculateClassAttendance(className)}%</div>
        </div>
        <h4>Students List</h4>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Attendance</th>
                        <th>Average Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.name}</td>
                            <td>${calculateStudentAttendance(student.id)}%</td>
                            <td>${calculateStudentAverage(student.id)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    showModal('viewClassModal');
}

function editClass(className) {
    let modal = document.getElementById('editClassModal');
    if (!modal) {
        modal = createEditClassModal();
        document.body.appendChild(modal);
    }

    // Populate form with class data
    document.getElementById('editClassName').value = className;
    
    showModal('editClassModal');
}

function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        // Remove from mockAssignments
        const index = mockAssignments.findIndex(a => a.id === id);
        if (index !== -1) {
            mockAssignments.splice(index, 1);
            loadAssignments(); // Refresh assignments list
            showNotification('Assignment deleted successfully');
        }
    }
}

// Logout Handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored data
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = '/html/login.html';
    }
}

// Button Click Handler
function handleButtonClick(e) {
    const action = e.currentTarget.getAttribute('data-action');
    switch(action) {
        case 'create-assignment':
            let modal = document.getElementById('addAssignmentModal');
            if (!modal) modal = createAddAssignmentModal();
            document.body.appendChild(modal);
            showModal('addAssignmentModal');
            break;
        case 'edit-profile':
            editProfile();
            break;
        case 'logout':
            handleLogout();
            break;
        case 'view-class':
            const className = e.currentTarget.getAttribute('data-class');
            viewClass(className);
            break;
        case 'edit-class':
            const classToEdit = e.currentTarget.getAttribute('data-class');
            editClass(classToEdit);
            break;
        case 'edit-assignment':
            const assignmentId = parseInt(e.currentTarget.getAttribute('data-id'));
            editAssignment(assignmentId);
            break;
        case 'delete-assignment':
            const deleteId = parseInt(e.currentTarget.getAttribute('data-id'));
            deleteAssignment(deleteId);
            break;
    }
}

// Assignment Management
function createAssignment() {
    // Populate class select in modal
    const classSelect = document.getElementById('assignmentClass');
    if (classSelect) {
        classSelect.innerHTML = `
            <option value="">Select Class</option>
            ${mockTeacherData.classes.map(className => 
                `<option value="${className}">${className}</option>`
            ).join('')}
        `;
    }
    
    // Show the modal
    showModal('createAssignmentModal');
}

// Profile Management
function editProfile() {
    // Create edit profile modal HTML if it doesn't exist
    let modal = document.getElementById('editProfileModal');
    if (!modal) {
        modal = createEditProfileModal();
        document.body.appendChild(modal);
    }
    
    // Populate form with current data
    document.getElementById('editProfileName').value = mockTeacherData.name;
    document.getElementById('editProfileEmail').value = mockTeacherData.email;
    document.getElementById('editProfileSubject').value = mockTeacherData.subject;
    
    // Show the modal
    showModal('editProfileModal');
}

function createEditProfileModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'editProfileModal';
    modalDiv.className = 'modal';
    modalDiv.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Edit Profile</h2>
                <span class="close-modal" onclick="hideModal()">&times;</span>
            </div>
            <form id="editProfileForm">
                <div class="form-group">
                    <label for="editProfileName">Name</label>
                    <input type="text" id="editProfileName" required>
                </div>
                <div class="form-group">
                    <label for="editProfileEmail">Email</label>
                    <input type="email" id="editProfileEmail" required>
                </div>
                <div class="form-group">
                    <label for="editProfileSubject">Subject</label>
                    <input type="text" id="editProfileSubject" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" onclick="hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    return modalDiv;
}

// Update HTML to use data-action instead of onclick
function updateButtonAttributes() {
    // Update create assignment buttons
    document.querySelectorAll('button[onclick*="createAssignment"]').forEach(button => {
        button.removeAttribute('onclick');
        button.setAttribute('data-action', 'create-assignment');
    });

    // Update edit profile button
    const editProfileButton = document.querySelector('button[onclick*="editProfile"]');
    if (editProfileButton) {
        editProfileButton.removeAttribute('onclick');
        editProfileButton.setAttribute('data-action', 'edit-profile');
    }
}

// Export necessary functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mockTeacherData,
        mockStudents,
        mockAssignments,
        switchTab,
        showNotification,
        handleLogout
    };
}

function createViewClassModal() {
    const modal = document.createElement('div');
    modal.id = 'viewClassModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Class Details</h2>
                <span class="close-modal" data-action="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                Loading...
            </div>
        </div>
    `;
    return modal;
}

function createEditClassModal() {
    const modal = document.createElement('div');
    modal.id = 'editClassModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Edit Class</h2>
                <span class="close-modal" data-action="close-modal">&times;</span>
            </div>
            <form id="editClassForm">
                <div class="form-group">
                    <label for="editClassName">Class Name</label>
                    <input type="text" id="editClassName" required>
                </div>
                <div class="form-group">
                    <label for="editClassSchedule">Schedule</label>
                    <input type="text" id="editClassSchedule" placeholder="e.g., Mon, Wed, Fri">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" data-action="close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    return modal;
}

// Attendance Management
function updateAttendance(studentId, status, notes = '') {
    const classId = document.getElementById('attendanceClass').value;
    const date = document.getElementById('attendanceDate').value;

    if (!mockAttendance[date]) {
        mockAttendance[date] = {};
    }
    if (!mockAttendance[date][classId]) {
        mockAttendance[date][classId] = [];
    }

    const attendanceRecord = {
        studentId,
        status,
        notes
    };

    const existingIndex = mockAttendance[date][classId].findIndex(record => record.studentId === studentId);
    if (existingIndex !== -1) {
        mockAttendance[date][classId][existingIndex] = attendanceRecord;
    } else {
        mockAttendance[date][classId].push(attendanceRecord);
    }

    showNotification('Attendance updated successfully');
    loadAttendanceData(classId, date);
}

function loadAttendanceData(classId, date) {
    const students = mockStudents.filter(student => student.class === classId.split(' ')[1]);
    const attendanceRecords = mockAttendance[date]?.[classId] || [];

    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;

    tbody.innerHTML = students.map(student => {
        const record = attendanceRecords.find(r => r.studentId === student.id);
        return `
            <tr>
                <td>${student.name}</td>
                <td>
                    <select onchange="updateAttendance(${student.id}, this.value)" class="form-select">
                        <option value="present" ${record?.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" ${record?.status === 'absent' ? 'selected' : ''}>Absent</option>
                        <option value="late" ${record?.status === 'late' ? 'selected' : ''}>Late</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-input" value="${record?.notes || ''}"
                           onchange="updateAttendanceNotes(${student.id}, this.value)">
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewStudentAttendance(${student.id})">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Grades Management
function updateGrade(studentId, assignmentId, grade) {
    const existingGrade = mockGrades.find(g => g.studentId === studentId && g.assignmentId === assignmentId);
    if (existingGrade) {
        existingGrade.grade = grade;
    } else {
        mockGrades.push({
            studentId,
            assignmentId,
            grade,
            submissionDate: new Date().toISOString().split('T')[0]
        });
    }

    showNotification('Grade updated successfully');
    loadGradesData();
}

function loadGradesData() {
    const classId = document.getElementById('gradesClass').value;
    const assignmentId = parseInt(document.getElementById('gradesAssignment').value);

    if (!classId || !assignmentId) return;

    const students = mockStudents.filter(student => student.class === classId.split(' ')[1]);
    const tbody = document.getElementById('gradesTableBody');
    if (!tbody) return;

    tbody.innerHTML = students.map(student => {
        const gradeRecord = mockGrades.find(g => g.studentId === student.id && g.assignmentId === assignmentId);
        return `
            <tr>
                <td>${student.name}</td>
                <td>
                    <input type="number" min="0" max="100" class="form-input" 
                           value="${gradeRecord?.grade || ''}"
                           onchange="updateGrade(${student.id}, ${assignmentId}, this.value)">
                </td>
                <td>${gradeRecord?.submissionDate || 'Not submitted'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewStudentGrades(${student.id})">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Utility Functions
function calculateClassAttendance(className) {
    let totalPresent = 0;
    let totalRecords = 0;

    // Calculate attendance for all dates
    Object.values(mockAttendance).forEach(dateRecord => {
        const classRecord = dateRecord[className];
        if (classRecord) {
            classRecord.forEach(record => {
                totalRecords++;
                if (record.status === 'present') totalPresent++;
                // Count 'late' as 0.5 present
                else if (record.status === 'late') totalPresent += 0.5;
            });
        }
    });

    return totalRecords === 0 ? 0 : Math.round((totalPresent / totalRecords) * 100);
}

function calculateStudentAttendance(studentId) {
    let totalPresent = 0;
    let totalRecords = 0;

    // Calculate attendance across all dates and classes
    Object.values(mockAttendance).forEach(dateRecord => {
        Object.values(dateRecord).forEach(classRecord => {
            const studentRecord = classRecord.find(r => r.studentId === studentId);
            if (studentRecord) {
                totalRecords++;
                if (studentRecord.status === 'present') totalPresent++;
                else if (studentRecord.status === 'late') totalPresent += 0.5;
            }
        });
    });

    return totalRecords === 0 ? 0 : Math.round((totalPresent / totalRecords) * 100);
}

function calculateStudentAverage(studentId) {
    const grades = mockGrades.filter(g => g.studentId === studentId);
    if (grades.length === 0) return 'N/A';
    const average = grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
    return average.toFixed(1);
}

function viewStudentAttendance(studentId) {
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;

    let modal = document.getElementById('studentAttendanceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'studentAttendanceModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    // Collect all attendance records for the student
    const attendanceHistory = [];
    Object.entries(mockAttendance).forEach(([date, dateRecord]) => {
        Object.entries(dateRecord).forEach(([className, classRecord]) => {
            const record = classRecord.find(r => r.studentId === studentId);
            if (record) {
                attendanceHistory.push({
                    date,
                    className,
                    status: record.status,
                    notes: record.notes
                });
            }
        });
    });

    // Sort by date in descending order
    attendanceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Attendance History - ${student.name}</h2>
                <span class="close-modal" onclick="hideModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="attendance-summary">
                    <div class="stat">
                        <div class="stat-label">Overall Attendance</div>
                        <div class="stat-value">${calculateStudentAttendance(studentId)}%</div>
                    </div>
                </div>
                <div class="attendance-history">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Class</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${attendanceHistory.map(record => `
                                <tr>
                                    <td>${formatDate(record.date)}</td>
                                    <td>${record.className}</td>
                                    <td><span class="status-badge status-${record.status}">${record.status}</span></td>
                                    <td>${record.notes || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    showModal('studentAttendanceModal');
}

function viewStudentGrades(studentId) {
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;

    let modal = document.getElementById('studentGradesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'studentGradesModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    // Get all grades for the student
    const studentGrades = mockGrades
        .filter(g => g.studentId === studentId)
        .map(grade => {
            const assignment = mockAssignments.find(a => a.id === grade.assignmentId);
            return {
                ...grade,
                assignmentTitle: assignment?.title || 'Unknown Assignment',
                className: assignment?.class || 'Unknown Class'
            };
        });

    // Calculate statistics
    const averageGrade = studentGrades.length > 0
        ? (studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length).toFixed(1)
        : 'N/A';

    const highestGrade = studentGrades.length > 0
        ? Math.max(...studentGrades.map(g => g.grade))
        : 'N/A';

    const lowestGrade = studentGrades.length > 0
        ? Math.min(...studentGrades.map(g => g.grade))
        : 'N/A';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Grade History - ${student.name}</h2>
                <span class="close-modal" onclick="hideModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="grades-summary">
                    <div class="stat">
                        <div class="stat-label">Average Grade</div>
                        <div class="stat-value">${averageGrade}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Highest Grade</div>
                        <div class="stat-value">${highestGrade}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Lowest Grade</div>
                        <div class="stat-value">${lowestGrade}</div>
                    </div>
                </div>
                <div class="grades-history">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Assignment</th>
                                <th>Class</th>
                                <th>Grade</th>
                                <th>Submission Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentGrades.map(grade => `
                                <tr>
                                    <td>${grade.assignmentTitle}</td>
                                    <td>${grade.className}</td>
                                    <td>${grade.grade}</td>
                                    <td>${formatDate(grade.submissionDate)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    showModal('studentGradesModal');
}

function updateAttendanceNotes(studentId, notes) {
    const classId = document.getElementById('attendanceClass').value;
    const date = document.getElementById('attendanceDate').value;
    
    if (mockAttendance[date]?.[classId]) {
        const record = mockAttendance[date][classId].find(r => r.studentId === studentId);
        if (record) {
            record.notes = notes;
            showNotification('Notes updated successfully');
        }
    }
}

// Event Listeners for Select Changes
document.getElementById('attendanceClass')?.addEventListener('change', function(e) {
    const date = document.getElementById('attendanceDate').value;
    loadAttendanceData(e.target.value, date);
});

document.getElementById('attendanceDate')?.addEventListener('change', function(e) {
    const classId = document.getElementById('attendanceClass').value;
    loadAttendanceData(classId, e.target.value);
});

document.getElementById('gradesClass')?.addEventListener('change', function(e) {
    // Update assignments dropdown based on selected class
    const assignmentSelect = document.getElementById('gradesAssignment');
    if (assignmentSelect) {
        const classAssignments = mockAssignments.filter(a => a.class === e.target.value.split(' ')[1]);
        assignmentSelect.innerHTML = `
            <option value="">Select Assignment</option>
            ${classAssignments.map(assignment => 
                `<option value="${assignment.id}">${assignment.title}</option>`
            ).join('')}
        `;
    }
});

document.getElementById('gradesAssignment')?.addEventListener('change', function() {
    loadGradesData();
});

// Add Class Functions
function createAddClassModal() {
    const modal = document.createElement('div');
    modal.id = 'addClassModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Class</h2>
                <span class="close-modal" data-action="cancel">&times;</span>
            </div>
            <form id="addClassForm" onsubmit="handleAddClass(event)">
                <div class="form-group">
                    <label for="className">Class Name</label>
                    <input type="text" id="className" required placeholder="e.g., Class 10A">
                </div>
                <div class="form-group">
                    <label for="classSchedule">Schedule</label>
                    <input type="text" id="classSchedule" required placeholder="e.g., Mon, Wed, Fri">
                </div>
                <div class="form-group">
                    <label for="classRoom">Room</label>
                    <input type="text" id="classRoom" required placeholder="e.g., Room 101">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" data-action="cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Class</button>
                </div>
            </form>
        </div>
    `;
    return modal;
}

function handleAddClass(event) {
    event.preventDefault();
    const className = document.getElementById('className').value;
    const schedule = document.getElementById('classSchedule').value;
    const room = document.getElementById('classRoom').value;

    // Add to mock data
    mockTeacherData.classes.push(className);
    mockTeacherData.schedule.push({
        time: "08:00 AM", // Default time, can be modified later
        class: className,
        subject: mockTeacherData.subject,
        room: room
    });

    // Update UI
    loadClasses();
    hideModal();
    showNotification('Class added successfully');
}

// Add Assignment Functions
function createAddAssignmentModal() {
    const modal = document.createElement('div');
    modal.id = 'addAssignmentModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Assignment</h2>
                <span class="close-modal" data-action="cancel">&times;</span>
            </div>
            <form id="addAssignmentForm" onsubmit="handleAddAssignment(event)">
                <div class="form-group">
                    <label for="assignmentTitle">Title</label>
                    <input type="text" id="assignmentTitle" required placeholder="e.g., Chapter 1 Exercise">
                </div>
                <div class="form-group">
                    <label for="assignmentClass">Class</label>
                    <select id="assignmentClass" required>
                        ${mockTeacherData.classes.map(className => 
                            `<option value="${className.split(' ')[1]}">${className}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="assignmentDescription">Description</label>
                    <textarea id="assignmentDescription" required placeholder="Assignment description..."></textarea>
                </div>
                <div class="form-group">
                    <label for="assignmentDueDate">Due Date</label>
                    <input type="date" id="assignmentDueDate" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" data-action="cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Assignment</button>
                </div>
            </form>
        </div>
    `;
    return modal;
}

function handleAddAssignment(event) {
    event.preventDefault();
    const title = document.getElementById('assignmentTitle').value;
    const className = document.getElementById('assignmentClass').value;
    const description = document.getElementById('assignmentDescription').value;
    const dueDate = document.getElementById('assignmentDueDate').value;

    // Generate new ID
    const newId = Math.max(...mockAssignments.map(a => a.id), 0) + 1;

    // Add to mock data
    mockAssignments.push({
        id: newId,
        title: title,
        description: description,
        dueDate: dueDate,
        class: className,
        status: 'pending'
    });

    // Update UI
    loadAssignments();
    hideModal();
    showNotification('Assignment added successfully');
}

// Add Student Functions
function createAddStudentModal() {
    const modal = document.createElement('div');
    modal.id = 'addStudentModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Student</h2>
                <span class="close-modal" data-action="cancel">&times;</span>
            </div>
            <form id="addStudentForm" onsubmit="handleAddStudent(event)">
                <div class="form-group">
                    <label for="studentName">Full Name</label>
                    <input type="text" id="studentName" required placeholder="e.g., John Doe">
                </div>
                <div class="form-group">
                    <label for="studentClass">Class</label>
                    <select id="studentClass" required>
                        ${mockTeacherData.classes.map(className => 
                            `<option value="${className.split(' ')[1]}">${className}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="studentEmail">Email</label>
                    <input type="email" id="studentEmail" required placeholder="e.g., john.doe@school.edu">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" data-action="cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Student</button>
                </div>
            </form>
        </div>
    `;
    return modal;
}

function handleAddStudent(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value;
    const className = document.getElementById('studentClass').value;
    const email = document.getElementById('studentEmail').value;

    // Generate new ID
    const newId = Math.max(...mockStudents.map(s => s.id), 0) + 1;

    // Add to mock data
    mockStudents.push({
        id: newId,
        name: name,
        class: className,
        email: email
    });

    // Update UI
    loadClasses();
    hideModal();
    showNotification('Student added successfully');
}

// Add buttons to the UI
function addActionButtons() {
    // Add class button
    const classesHeader = document.querySelector('#classes-section .section-header');
    if (classesHeader) {
        const addClassButton = document.createElement('button');
        addClassButton.className = 'btn btn-primary';
        addClassButton.innerHTML = '<i class="fas fa-plus"></i> Add Class';
        addClassButton.onclick = () => {
            let modal = document.getElementById('addClassModal');
            if (!modal) modal = createAddClassModal();
            showModal('addClassModal');
        };
        classesHeader.appendChild(addClassButton);
    }

    // Add assignment button
    const assignmentsHeader = document.querySelector('#assignments-section .section-header');
    if (assignmentsHeader) {
        const addAssignmentButton = document.createElement('button');
        addAssignmentButton.className = 'btn btn-primary';
        addAssignmentButton.innerHTML = '<i class="fas fa-plus"></i> Add Assignment';
        addAssignmentButton.onclick = () => {
            let modal = document.getElementById('addAssignmentModal');
            if (!modal) modal = createAddAssignmentModal();
            showModal('addAssignmentModal');
        };
        assignmentsHeader.appendChild(addAssignmentButton);
    }

    // Add student button
    const classesSection = document.querySelector('#classes-section .section-content');
    if (classesSection) {
        const addStudentButton = document.createElement('button');
        addStudentButton.className = 'btn btn-primary';
        addStudentButton.innerHTML = '<i class="fas fa-plus"></i> Add Student';
        addStudentButton.onclick = () => {
            let modal = document.getElementById('addStudentModal');
            if (!modal) modal = createAddStudentModal();
            showModal('addStudentModal');
        };
        classesSection.insertBefore(addStudentButton, classesSection.firstChild);
    }
}

// Initialize header with teacher info
function initializeHeader() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (userAvatar) {
        userAvatar.textContent = getInitials(mockTeacherData.name);
    }
    if (userName) {
        userName.textContent = mockTeacherData.name;
    }

    // Update page title with teacher name
    document.title = `${mockTeacherData.name} - Teacher Portal | SMS`;
} 