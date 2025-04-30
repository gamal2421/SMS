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

// UI Functions
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.style.display = 'none');

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => button.classList.remove('active'));

    // Show the selected tab content and activate its button
    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');

    // Load tab-specific data
    switch(tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'classes':
            updateClasses();
            break;
        case 'students':
            updateStudents();
            break;
        case 'assignments':
            updateAssignments();
            break;
        case 'profile':
            updateProfile();
            break;
    }
}

// Dashboard Updates
function updateDashboard() {
    // Update stats
    document.getElementById('total-classes').textContent = mockData.stats.totalClasses;
    document.getElementById('total-students').textContent = mockData.stats.totalStudents;
    document.getElementById('total-assignments').textContent = mockData.stats.totalAssignments;
    document.getElementById('attendance-rate').textContent = mockData.stats.attendanceRate + '%';

    // Update schedule
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = mockData.schedule.map(item => `
        <div class="schedule-item">
            <div class="schedule-time">${item.time}</div>
            <div class="schedule-details">
                <h3>${item.class} - ${item.subject}</h3>
                <p>${item.room}</p>
            </div>
        </div>
    `).join('');
}

// Classes Updates
function updateClasses() {
    const classesList = document.getElementById('classes-list');
    classesList.innerHTML = mockData.classes.map(classItem => `
        <div class="card">
            <h3>${classItem.name}</h3>
            <p><strong>Subject:</strong> ${classItem.subject}</p>
            <p><strong>Students:</strong> ${classItem.students}</p>
            <p><strong>Schedule:</strong> ${classItem.schedule}</p>
            <p><strong>Room:</strong> ${classItem.room}</p>
            <div class="card-actions">
                <button class="btn btn-secondary" onclick="viewClassDetails('${classItem.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Students Updates
function updateStudents() {
    const studentsList = document.getElementById('students-list');
    studentsList.innerHTML = mockData.students.map(student => `
        <div class="card">
            <h3>${student.name}</h3>
            <p><strong>Grade:</strong> ${student.grade}</p>
            <p><strong>Attendance:</strong> ${student.attendance}</p>
            <p><strong>Performance:</strong> ${student.performance}</p>
            <div class="card-actions">
                <button class="btn btn-secondary" onclick="viewStudentDetails('${student.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Assignments Updates
function updateAssignments() {
    const assignmentsList = document.getElementById('assignments-list');
    assignmentsList.innerHTML = mockData.assignments.map(assignment => `
        <div class="card">
            <h3>${assignment.title}</h3>
            <p><strong>Class:</strong> ${assignment.class}</p>
            <p><strong>Due Date:</strong> ${assignment.dueDate}</p>
            <p><strong>Status:</strong> ${assignment.status}</p>
            <p><strong>Submissions:</strong> ${assignment.submissions}/${assignment.totalStudents}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(assignment.submissions/assignment.totalStudents*100)}%"></div>
            </div>
            <div class="card-actions">
                <button class="btn btn-secondary" onclick="viewAssignmentDetails('${assignment.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Profile Updates
function updateProfile() {
    const user = mockData.currentUser;
    document.getElementById('profile-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-phone').textContent = user.phone;
    document.getElementById('profile-subjects').textContent = user.subjects.join(', ');
    document.getElementById('profile-qualification').textContent = user.qualification;
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Update user info in header
    const user = mockData.currentUser;
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userAvatar').textContent = `${user.firstName[0]}${user.lastName[0]}`;
    
    // Set initial active tab
    openTab('dashboard');
    
    // Show welcome toast
    showToast('Welcome back, ' + user.firstName + '!', 'info');
}); 