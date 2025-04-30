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
        case 'users':
            updateUsers();
            break;
        case 'classes':
            updateClasses();
            break;
        case 'announcements':
            updateAnnouncements();
            break;
        case 'reports':
            updateReports();
            break;
        case 'settings':
            updateSettings();
            break;
    }
}

// Dashboard Updates
function updateDashboard() {
    // Update stats
    document.getElementById('total-students').textContent = mockData.stats.totalStudents;
    document.getElementById('total-teachers').textContent = mockData.stats.totalTeachers;
    document.getElementById('total-classes').textContent = mockData.stats.totalClasses;
    document.getElementById('active-users').textContent = mockData.stats.activeUsers;

    // Update recent activities
    const activitiesList = document.getElementById('recent-activities');
    activitiesList.innerHTML = mockData.recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas fa-${activity.type === 'user' ? 'user' : activity.type === 'class' ? 'chalkboard' : 'cog'}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-action">${activity.action}</div>
                ${activity.user ? `<div class="activity-user">${activity.user}</div>` : ''}
                ${activity.details ? `<div class="activity-info">${activity.details}</div>` : ''}
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// Users Updates
function updateUsers() {
    const usersList = document.getElementById('users-list');
    const userType = document.getElementById('user-type').value;
    const users = mockData.users[userType];

    usersList.innerHTML = users.map(user => `
        <div class="card">
            <div class="user-header">
                <div class="user-avatar">${user.name.split(' ').map(n => n[0]).join('')}</div>
                <div class="user-info">
                    <h3>${user.name}</h3>
                    <p class="user-type">${userType.slice(0, -1)}</p>
                </div>
                <div class="user-status ${user.status.toLowerCase()}">${user.status}</div>
            </div>
            <div class="user-details">
                ${userType === 'students' ? `
                    <p><strong>Grade:</strong> ${user.grade}</p>
                ` : userType === 'teachers' ? `
                    <p><strong>Subjects:</strong> ${user.subjects.join(', ')}</p>
                ` : `
                    <p><strong>Children:</strong> ${user.children.join(', ')}</p>
                `}
                <p><strong>Join Date:</strong> ${user.joinDate}</p>
            </div>
            <div class="card-actions">
                <button class="btn btn-secondary" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary" onclick="viewUserDetails('${user.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
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
            <p><strong>Teacher:</strong> ${classItem.teacher}</p>
            <p><strong>Students:</strong> ${classItem.students}</p>
            <p><strong>Subjects:</strong> ${classItem.subjects.join(', ')}</p>
            <div class="card-actions">
                <button class="btn btn-secondary" onclick="editClass('${classItem.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary" onclick="viewClassDetails('${classItem.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        </div>
    `).join('');
}

// Announcements Updates
function updateAnnouncements() {
    const announcementsList = document.getElementById('announcements-list');
    announcementsList.innerHTML = mockData.announcements.map(announcement => `
        <div class="card">
            <div class="announcement-header ${announcement.priority}">
                <h3>${announcement.title}</h3>
                <span class="announcement-date">${announcement.date}</span>
            </div>
            <p>${announcement.content}</p>
            <div class="card-actions">
                <button class="btn btn-secondary" onclick="editAnnouncement('${announcement.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary" onclick="deleteAnnouncement('${announcement.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Reports Updates
function updateReports() {
    // Update attendance chart
    const attendanceData = mockData.reports.attendance;
    document.getElementById('attendance-stats').innerHTML = `
        <div class="chart-container">
            <h3>Monthly Attendance Rate</h3>
            <div class="chart">
                ${attendanceData.data.map((value, index) => `
                    <div class="chart-bar" style="height: ${value}%">
                        <span class="chart-value">${value}%</span>
                        <span class="chart-label">${attendanceData.labels[index]}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Update performance chart
    const performanceData = mockData.reports.performance;
    document.getElementById('performance-stats').innerHTML = `
        <div class="chart-container">
            <h3>Grade-wise Performance</h3>
            <div class="chart">
                ${performanceData.data.map((value, index) => `
                    <div class="chart-bar" style="height: ${value}%">
                        <span class="chart-value">${value}%</span>
                        <span class="chart-label">${performanceData.labels[index]}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Settings Updates
function updateSettings() {
    // This would typically load system settings, but for now we'll just show a message
    document.getElementById('settings-content').innerHTML = `
        <div class="settings-section">
            <h3>System Settings</h3>
            <div class="form-group">
                <label class="form-label">School Name</label>
                <input type="text" class="form-input" value="International School" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Academic Year</label>
                <input type="text" class="form-input" value="2023-2024" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">System Theme</label>
                <select class="form-input">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>
        </div>
    `;
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