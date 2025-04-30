// Mock Data
const mockData = {
    students: [
        { id: 1, firstName: 'John', lastName: 'Smith', email: 'john@school.com', grade: '10', section: 'A', contact: '123-456-7890' },
        { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@school.com', grade: '11', section: 'B', contact: '123-456-7891' },
        { id: 3, firstName: 'Mike', lastName: 'Wilson', email: 'mike@school.com', grade: '9', section: 'C', contact: '123-456-7892' }
    ],
    teachers: [
        { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@school.com', subject: 'Mathematics', contact: '123-456-7893' },
        { id: 2, firstName: 'Robert', lastName: 'Brown', email: 'robert@school.com', subject: 'English', contact: '123-456-7894' },
        { id: 3, firstName: 'Emily', lastName: 'White', email: 'emily@school.com', subject: 'Science', contact: '123-456-7895' }
    ],
    classes: [
        { id: 1, name: 'Mathematics 10A', grade: '10', teacher: 'Jane Doe', students: 30 },
        { id: 2, name: 'English 11B', grade: '11', teacher: 'Robert Brown', students: 25 },
        { id: 3, name: 'Science 9C', grade: '9', teacher: 'Emily White', students: 28 }
    ],
    activities: [
        { action: 'New student registered', timestamp: '2 hours ago' },
        { action: 'Teacher updated profile', timestamp: '3 hours ago' },
        { action: 'New class created', timestamp: '1 day ago' },
        { action: 'System maintenance completed', timestamp: '2 days ago' }
    ]
};

// Initialize data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    updateDashboardStats();
    loadActivities();
    openTab('dashboard');
});

// User Profile Functions
function loadUserProfile() {
    const adminUser = {
        initials: 'AD',
        name: 'Admin User',
        email: 'admin@school.com'
    };

    document.getElementById('userAvatar').textContent = adminUser.initials;
    document.getElementById('userName').textContent = adminUser.name;
    document.getElementById('profileName').textContent = adminUser.name;
    document.getElementById('profileEmail').textContent = adminUser.email;
    document.getElementById('profileAvatar').textContent = adminUser.initials;
}

// Tab Management
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab and activate button
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');

    // Load tab-specific data
    switch(tabName) {
        case 'dashboard':
            updateDashboardStats();
            loadActivities();
            break;
        case 'students':
            loadStudents();
            break;
        case 'teachers':
            loadTeachers();
            break;
        case 'classes':
            loadClasses();
            break;
    }
}

// Dashboard Functions
function updateDashboardStats() {
    document.getElementById('totalStudents').textContent = mockData.students.length;
    document.getElementById('totalTeachers').textContent = mockData.teachers.length;
    document.getElementById('totalClasses').textContent = mockData.classes.length;
    document.getElementById('totalParents').textContent = mockData.students.length; // Assuming one parent per student
}

function loadActivities() {
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = mockData.activities.map(activity => `
        <li>
            <i class="fas fa-bell"></i>
            <span>${activity.action}</span>
            <small>${activity.timestamp}</small>
        </li>
    `).join('');
}

// Student Management Functions
function loadStudents() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = mockData.students.map(student => `
        <tr>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.grade}</td>
            <td>${student.section}</td>
            <td>${student.contact}</td>
            <td>
                <button class="btn btn-sm" onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function addStudent() {
    const modal = document.getElementById('addStudentModal');
    modal.style.display = 'block';
}

// Teacher Management Functions
function loadTeachers() {
    const tbody = document.getElementById('teachersTableBody');
    tbody.innerHTML = mockData.teachers.map(teacher => `
        <tr>
            <td>${teacher.firstName} ${teacher.lastName}</td>
            <td>${teacher.subject}</td>
            <td>${getTeacherClasses(teacher.firstName + ' ' + teacher.lastName)}</td>
            <td>${teacher.contact}</td>
            <td>
                <button class="btn btn-sm" onclick="editTeacher(${teacher.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" onclick="deleteTeacher(${teacher.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getTeacherClasses(teacherName) {
    return mockData.classes
        .filter(cls => cls.teacher === teacherName)
        .map(cls => cls.name)
        .join(', ') || 'No classes assigned';
}

function addTeacher() {
    const modal = document.getElementById('addTeacherModal');
    modal.style.display = 'block';
}

// Class Management Functions
function loadClasses() {
    const tbody = document.getElementById('classesTableBody');
    tbody.innerHTML = mockData.classes.map(cls => `
        <tr>
            <td>${cls.name}</td>
            <td>${cls.grade}</td>
            <td>${cls.teacher}</td>
            <td>${cls.students}</td>
            <td>
                <button class="btn btn-sm" onclick="editClass(${cls.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" onclick="deleteClass(${cls.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function addClass() {
    const modal = document.getElementById('addClassModal');
    modal.style.display = 'block';
    
    // Populate teacher dropdown
    const teacherSelect = document.getElementById('classTeacher');
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>' +
        mockData.teachers.map(teacher => 
            `<option value="${teacher.id}">${teacher.firstName} ${teacher.lastName}</option>`
        ).join('');
}

// Modal Functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Form Submission Handlers
document.getElementById('addStudentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const newStudent = {
        id: mockData.students.length + 1,
        firstName: document.getElementById('studentFirstName').value,
        lastName: document.getElementById('studentLastName').value,
        email: document.getElementById('studentEmail').value,
        grade: document.getElementById('studentGrade').value,
        section: document.getElementById('studentSection').value,
        contact: document.getElementById('studentContact').value
    };
    mockData.students.push(newStudent);
    loadStudents();
    closeModal('addStudentModal');
    this.reset();
    updateDashboardStats();
});

document.getElementById('addTeacherForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const newTeacher = {
        id: mockData.teachers.length + 1,
        firstName: document.getElementById('teacherFirstName').value,
        lastName: document.getElementById('teacherLastName').value,
        email: document.getElementById('teacherEmail').value,
        subject: document.getElementById('teacherSubject').value,
        contact: document.getElementById('teacherContact').value
    };
    mockData.teachers.push(newTeacher);
    loadTeachers();
    closeModal('addTeacherModal');
    this.reset();
    updateDashboardStats();
});

document.getElementById('addClassForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const teacherId = document.getElementById('classTeacher').value;
    const teacher = mockData.teachers.find(t => t.id === parseInt(teacherId));
    const newClass = {
        id: mockData.classes.length + 1,
        name: document.getElementById('className').value,
        grade: document.getElementById('classGrade').value,
        teacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : '',
        students: 0
    };
    mockData.classes.push(newClass);
    loadClasses();
    closeModal('addClassModal');
    this.reset();
    updateDashboardStats();
});

// Logout Function
function logout() {
    // Clear user session data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('rememberMe');
    
    // Show logout notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>Successfully logged out!</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Add fade-in animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Redirect after a short delay
    setTimeout(() => {
        window.location.href = '/html/login.html';
    }, 1500);
}

// CRUD Operations
function editStudent(id) {
    alert('Edit student ' + id + ' (Feature to be implemented)');
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        mockData.students = mockData.students.filter(student => student.id !== id);
        loadStudents();
        updateDashboardStats();
    }
}

function editTeacher(id) {
    alert('Edit teacher ' + id + ' (Feature to be implemented)');
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        mockData.teachers = mockData.teachers.filter(teacher => teacher.id !== id);
        loadTeachers();
        updateDashboardStats();
    }
}

function editClass(id) {
    alert('Edit class ' + id + ' (Feature to be implemented)');
}

function deleteClass(id) {
    if (confirm('Are you sure you want to delete this class?')) {
        mockData.classes = mockData.classes.filter(cls => cls.id !== id);
        loadClasses();
        updateDashboardStats();
    }
} 