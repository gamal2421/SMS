// Check authentication and role
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    loadUserData();
});

// Load user data
async function loadUserData() {
    try {
        const user = getCurrentUser();
        const response = await apiCall(`http://localhost:3000/api/users/${user.userId}`);
        const userData = await response.json();

        // Update profile information
        document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('userAvatar').textContent = getInitials(user.firstName, user.lastName);
        document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileAvatar').textContent = getInitials(user.firstName, user.lastName);

        // Load role-specific data
        switch(user.role) {
            case 'admin':
                loadAdminData();
                break;
            case 'teacher':
                loadTeacherData();
                break;
            case 'parent':
                loadParentData();
                break;
            case 'visitor':
                loadVisitorData();
                break;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        alert('Error loading user data');
    }
}

// Admin-specific data loading
async function loadAdminData() {
    try {
        // Load dashboard statistics
        const statsResponse = await apiCall('http://localhost:3000/api/admin/stats');
        const stats = await statsResponse.json();
        
        // Update statistics in the UI
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('totalTeachers').textContent = stats.totalTeachers;
        document.getElementById('totalClasses').textContent = stats.totalClasses;
        document.getElementById('totalParents').textContent = stats.totalParents;

        // Load recent activities
        const activitiesResponse = await apiCall('http://localhost:3000/api/admin/activities');
        const activities = await activitiesResponse.json();
        
        const activitiesList = document.getElementById('activitiesList');
        activitiesList.innerHTML = '';
        activities.forEach(activity => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                    </div>
                </div>
            `;
            activitiesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading admin data:', error);
        alert('Error loading admin data');
    }
}

// Teacher-specific data loading
async function loadTeacherData() {
    try {
        const user = getCurrentUser();
        
        // Load teacher's classes
        const classesResponse = await apiCall(`http://localhost:3000/api/teachers/${user.userId}/classes`);
        const classes = await classesResponse.json();
        
        const classesList = document.getElementById('classesList');
        classesList.innerHTML = '';
        classes.forEach(classItem => {
            const div = document.createElement('div');
            div.className = 'class-card';
            div.innerHTML = `
                <div class="class-header">
                    <h3>${classItem.subject}</h3>
                    <span class="badge">${classItem.grade} Grade</span>
                </div>
                <div class="class-info">
                    <p><i class="fas fa-users"></i> ${classItem.studentCount} Students</p>
                    <p><i class="fas fa-clock"></i> ${classItem.schedule}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${classItem.room}</p>
                </div>
            `;
            classesList.appendChild(div);
        });

        // Load upcoming assignments
        const assignmentsResponse = await apiCall(`http://localhost:3000/api/teachers/${user.userId}/assignments`);
        const assignments = await assignmentsResponse.json();
        
        const assignmentsList = document.getElementById('assignmentsList');
        assignmentsList.innerHTML = '';
        assignments.forEach(assignment => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${assignment.title}</td>
                <td>${assignment.class}</td>
                <td>${new Date(assignment.dueDate).toLocaleDateString()}</td>
                <td>${assignment.submittedCount}/${assignment.totalStudents}</td>
                <td>
                    <button class="btn btn-primary" onclick="viewAssignment('${assignment.id}')">
                        View Details
                    </button>
                </td>
            `;
            assignmentsList.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading teacher data:', error);
        alert('Error loading teacher data');
    }
}

// Parent-specific data loading
async function loadParentData() {
    try {
        const user = getCurrentUser();
        
        // Load children's information
        const childrenResponse = await apiCall(`http://localhost:3000/api/parents/${user.userId}/children`);
        const children = await childrenResponse.json();
        
        const childrenList = document.getElementById('childrenList');
        childrenList.innerHTML = '';
        children.forEach(child => {
            const div = document.createElement('div');
            div.className = 'child-card';
            div.innerHTML = `
                <div class="child-header">
                    <h3>${child.name}</h3>
                    <span class="badge">Grade ${child.grade}</span>
                </div>
                <div class="child-info">
                    <p><i class="fas fa-book"></i> ${child.class}</p>
                    <p><i class="fas fa-star"></i> GPA: ${child.gpa}</p>
                    <p><i class="fas fa-calendar-check"></i> Attendance: ${child.attendance}%</p>
                </div>
                <button class="btn btn-primary" onclick="viewChildDetails('${child.id}')">
                    View Details
                </button>
            `;
            childrenList.appendChild(div);
        });

        // Load notifications
        const notificationsResponse = await apiCall(`http://localhost:3000/api/parents/${user.userId}/notifications`);
        const notifications = await notificationsResponse.json();
        
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = '';
        notifications.forEach(notification => {
            const li = document.createElement('li');
            li.className = `notification-item ${notification.type}`;
            li.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${new Date(notification.timestamp).toLocaleString()}</div>
                </div>
            `;
            notificationsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading parent data:', error);
        alert('Error loading parent data');
    }
}

// Visitor-specific data loading
async function loadVisitorData() {
    try {
        // Load public information
        const infoResponse = await apiCall('http://localhost:3000/api/visitor/info');
        const info = await infoResponse.json();
        
        // Update school information
        document.getElementById('schoolName').textContent = info.schoolName;
        document.getElementById('schoolDescription').textContent = info.description;
        document.getElementById('schoolAddress').textContent = info.address;
        document.getElementById('schoolContact').textContent = info.contact;

        // Load upcoming events
        const eventsResponse = await apiCall('http://localhost:3000/api/visitor/events');
        const events = await eventsResponse.json();
        
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '';
        events.forEach(event => {
            const div = document.createElement('div');
            div.className = 'event-card';
            div.innerHTML = `
                <div class="event-date">
                    <div class="event-day">${new Date(event.date).getDate()}</div>
                    <div class="event-month">${new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div class="event-details">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="event-info">
                        <span><i class="fas fa-clock"></i> ${new Date(event.date).toLocaleTimeString()}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                    </div>
                </div>
            `;
            eventsList.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading visitor data:', error);
        alert('Error loading visitor data');
    }
}

// Helper functions
function getInitials(firstName, lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

function getActivityIcon(type) {
    const icons = {
        'student': 'user-graduate',
        'teacher': 'chalkboard-teacher',
        'class': 'school',
        'assignment': 'tasks',
        'exam': 'file-alt',
        'payment': 'money-bill-wave',
        'default': 'bell'
    };
    return icons[type] || icons.default;
}

function getNotificationIcon(type) {
    const icons = {
        'grade': 'star',
        'attendance': 'calendar-check',
        'assignment': 'tasks',
        'event': 'calendar-alt',
        'payment': 'money-bill-wave',
        'default': 'bell'
    };
    return icons[type] || icons.default;
}

function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }

    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
} 