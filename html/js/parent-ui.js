// Mock Data
const mockData = {
    currentUser: {
        id: '1',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        role: 'parent'
    },
    children: [
        {
            id: '1',
            name: 'Mike Wilson',
            grade: '9-C',
            attendance: 95,
            averageGrade: 88
        }
    ],
    announcements: [
        { id: '1', title: 'Parent-Teacher Meeting', content: 'Annual parent-teacher meeting scheduled for April 5', date: '2024-03-10', priority: 'high' },
        { id: '2', title: 'School Holiday', content: 'School will be closed for spring break from March 20-28', date: '2024-03-15', priority: 'medium' }
    ],
    academics: {
        grades: {
            Mathematics: [85, 88, 82],
            Physics: [90, 87, 85],
            English: [88, 85, 89],
            Biology: [92, 90, 88],
            Chemistry: [85, 88, 86]
        },
        attendance: {
            present: 45,
            absent: 2,
            late: 3,
            total: 50
        },
        assignments: [
            { subject: 'Mathematics', title: 'Quadratic Equations', dueDate: '2024-03-20', status: 'Pending' },
            { subject: 'Physics', title: 'Newton\'s Laws', dueDate: '2024-03-18', status: 'Submitted' },
            { subject: 'English', title: 'Essay Writing', dueDate: '2024-03-25', status: 'Pending' }
        ]
    },
    schedule: [
        { day: 'Monday', periods: [
            { time: '8:00 AM', subject: 'Mathematics', teacher: 'Dr. Jane Doe' },
            { time: '9:30 AM', subject: 'Physics', teacher: 'Dr. Jane Doe' },
            { time: '11:00 AM', subject: 'English', teacher: 'Prof. Robert Brown' }
        ]},
        { day: 'Tuesday', periods: [
            { time: '8:00 AM', subject: 'Biology', teacher: 'Ms. Emily White' },
            { time: '9:30 AM', subject: 'Chemistry', teacher: 'Ms. Emily White' },
            { time: '11:00 AM', subject: 'Literature', teacher: 'Prof. Robert Brown' }
        ]}
    ],
    fees: [
        { id: '1', description: 'Tuition Fee Q1', amount: 2500, dueDate: '2024-03-30', status: 'Pending' },
        { id: '2', description: 'Library Fee', amount: 100, dueDate: '2024-03-15', status: 'Paid' },
        { id: '3', description: 'Lab Fee', amount: 150, dueDate: '2024-03-15', status: 'Paid' }
    ],
    communications: [
        { id: '1', from: 'Dr. Jane Doe', subject: 'Mathematics Performance', date: '2024-03-15', read: false },
        { id: '2', from: 'Principal Smith', subject: 'Academic Progress', date: '2024-03-10', read: true }
    ]
};

// UI Functions
function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.style.display = 'none');

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');

    switch(tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'academics':
            updateAcademics();
            break;
        case 'schedule':
            updateSchedule();
            break;
        case 'fees':
            updateFees();
            break;
        case 'communications':
            updateCommunications();
            break;
    }
}

function updateDashboard() {
    // Update children overview
    const childrenOverview = document.getElementById('children-overview');
    childrenOverview.innerHTML = mockData.children.map(child => `
        <div class="card">
            <div class="student-header">
                <div class="student-avatar">${child.name.split(' ').map(n => n[0]).join('')}</div>
                <div class="student-info">
                    <h3>${child.name}</h3>
                    <p>Grade ${child.grade}</p>
                </div>
            </div>
            <div class="student-stats">
                <div class="stat">
                    <label>Attendance</label>
                    <span>${child.attendance}%</span>
                </div>
                <div class="stat">
                    <label>Average Grade</label>
                    <span>${child.averageGrade}%</span>
                </div>
            </div>
        </div>
    `).join('');

    // Update announcements
    const announcementsList = document.getElementById('announcements-list');
    announcementsList.innerHTML = mockData.announcements.map(announcement => `
        <div class="card">
            <div class="announcement-header ${announcement.priority}">
                <h3>${announcement.title}</h3>
                <span class="announcement-date">${announcement.date}</span>
            </div>
            <p>${announcement.content}</p>
        </div>
    `).join('');
}

function updateAcademics() {
    const academicsContainer = document.getElementById('academics-container');
    const child = mockData.children[0]; // Assuming one child for simplicity

    // Grades Section
    const grades = Object.entries(mockData.academics.grades).map(([subject, grades]) => {
        const average = grades.reduce((a, b) => a + b, 0) / grades.length;
        return `
            <div class="card">
                <h3>${subject}</h3>
                <div class="grades-chart">
                    ${grades.map(grade => `
                        <div class="grade-bar" style="height: ${grade}%">
                            <span class="grade-value">${grade}%</span>
                        </div>
                    `).join('')}
                </div>
                <p><strong>Average:</strong> ${average.toFixed(1)}%</p>
            </div>
        `;
    }).join('');

    // Attendance Section
    const attendance = mockData.academics.attendance;
    const attendanceHtml = `
        <div class="attendance-summary">
            <div class="stat-card">
                <h3>Present</h3>
                <p>${attendance.present}</p>
                <span>${((attendance.present/attendance.total) * 100).toFixed(1)}%</span>
            </div>
            <div class="stat-card">
                <h3>Absent</h3>
                <p>${attendance.absent}</p>
                <span>${((attendance.absent/attendance.total) * 100).toFixed(1)}%</span>
            </div>
            <div class="stat-card">
                <h3>Late</h3>
                <p>${attendance.late}</p>
                <span>${((attendance.late/attendance.total) * 100).toFixed(1)}%</span>
            </div>
        </div>
    `;

    academicsContainer.innerHTML = `
        <div class="grades-section">
            <h2>Grades</h2>
            <div class="grades-grid">${grades}</div>
        </div>
        <div class="attendance-section">
            <h2>Attendance</h2>
            ${attendanceHtml}
        </div>
    `;
}

function updateSchedule() {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = mockData.schedule.map(day => `
        <div class="schedule-day">
            <h3>${day.day}</h3>
            ${day.periods.map(period => `
                <div class="schedule-period">
                    <span class="period-time">${period.time}</span>
                    <div class="period-details">
                        <h4>${period.subject}</h4>
                        <p>${period.teacher}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function updateFees() {
    const feesContainer = document.getElementById('fees-container');
    feesContainer.innerHTML = mockData.fees.map(fee => `
        <div class="card">
            <div class="fee-header">
                <h3>${fee.description}</h3>
                <span class="status ${fee.status.toLowerCase()}">${fee.status}</span>
            </div>
            <div class="fee-details">
                <p><strong>Amount:</strong> $${fee.amount}</p>
                <p><strong>Due Date:</strong> ${fee.dueDate}</p>
            </div>
            ${fee.status === 'Pending' ? `
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="payFee('${fee.id}')">
                        <i class="fas fa-credit-card"></i> Pay Now
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function updateCommunications() {
    const communicationsContainer = document.getElementById('communications-container');
    communicationsContainer.innerHTML = mockData.communications.map(message => `
        <div class="card ${message.read ? 'read' : 'unread'}">
            <div class="message-header">
                <h3>${message.subject}</h3>
                <span class="message-date">${message.date}</span>
            </div>
            <p><strong>From:</strong> ${message.from}</p>
            <div class="card-actions">
                <button class="btn btn-primary" onclick="viewMessage('${message.id}')">
                    <i class="fas fa-envelope-open"></i> Read
                </button>
                <button class="btn btn-secondary" onclick="replyMessage('${message.id}')">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
        </div>
    `).join('');
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