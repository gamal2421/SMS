// Teacher Dashboard Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication and role
    requireRole('teacher');
    
    // Load initial data
    loadDashboard();
    loadMyClasses();
    loadMyStudents();
    loadAttendance();
    loadAssignments();
    loadProfile();
});

// Dashboard functions
async function loadDashboard() {
    try {
        const response = await apiCall('/api/teachers/dashboard');
        const data = await response.json();
        
        // Update statistics
        document.getElementById('total-classes').textContent = data.totalClasses;
        document.getElementById('total-students').textContent = data.totalStudents;
        document.getElementById('total-assignments').textContent = data.totalAssignments;
        document.getElementById('attendance-rate').textContent = `${data.attendanceRate}%`;
        
        // Update schedule
        const scheduleList = document.getElementById('schedule-list');
        scheduleList.innerHTML = data.schedule.map(item => `
            <div class="schedule-item">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-details">
                    <div class="schedule-class">${item.className}</div>
                    <div class="schedule-room">Room: ${item.room}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

// My Classes functions
async function loadMyClasses() {
    try {
        const response = await apiCall('/api/teachers/classes');
        const classes = await response.json();
        
        const classesList = document.getElementById('classes-list');
        classesList.innerHTML = classes.map(cls => `
            <div class="class-card">
                <h3>${cls.name}</h3>
                <p>Grade: ${cls.grade}</p>
                <p>Students: ${cls.studentCount}</p>
                <button onclick="viewClassDetails('${cls._id}')">View Details</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load classes');
    }
}

async function viewClassDetails(classId) {
    try {
        const response = await apiCall(`/api/teachers/classes/${classId}`);
        const classDetails = await response.json();
        
        // Show class details modal
        const modal = document.getElementById('class-details-modal');
        modal.querySelector('.class-name').textContent = classDetails.name;
        modal.querySelector('.class-grade').textContent = classDetails.grade;
        modal.querySelector('.class-schedule').textContent = classDetails.schedule;
        modal.querySelector('.class-room').textContent = classDetails.room;
        
        // Populate students list
        const studentsList = modal.querySelector('.students-list');
        studentsList.innerHTML = classDetails.students.map(student => `
            <div class="student-item">
                <span>${student.name}</span>
                <span>${student.attendanceRate}% attendance</span>
            </div>
        `).join('');
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading class details:', error);
        showError('Failed to load class details');
    }
}

// My Students functions
async function loadMyStudents() {
    try {
        const response = await apiCall('/api/teachers/students');
        const students = await response.json();
        
        const studentsList = document.getElementById('students-list');
        studentsList.innerHTML = students.map(student => `
            <div class="student-card">
                <h3>${student.name}</h3>
                <p>Grade: ${student.grade}</p>
                <p>Class: ${student.className}</p>
                <button onclick="viewStudentDetails('${student._id}')">View Details</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students');
    }
}

// Attendance functions
async function loadAttendance() {
    try {
        const response = await apiCall('/api/teachers/attendance');
        const attendanceData = await response.json();
        
        // Update filters
        const classSelect = document.getElementById('attendance-class');
        classSelect.innerHTML = attendanceData.classes.map(cls => 
            `<option value="${cls._id}">${cls.name}</option>`
        ).join('');
        
        // Load initial attendance list
        updateAttendanceList(attendanceData.classes[0]?._id);
    } catch (error) {
        console.error('Error loading attendance data:', error);
        showError('Failed to load attendance data');
    }
}

async function updateAttendanceList(classId) {
    try {
        const response = await apiCall(`/api/teachers/attendance/${classId}`);
        const attendanceList = await response.json();
        
        const listContainer = document.getElementById('attendance-list');
        listContainer.innerHTML = attendanceList.map(item => `
            <div class="attendance-item">
                <div class="attendance-student">${item.studentName}</div>
                <div class="attendance-status">
                    <select onchange="updateAttendanceStatus('${item._id}', this.value)">
                        <option value="present" ${item.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" ${item.status === 'absent' ? 'selected' : ''}>Absent</option>
                        <option value="late" ${item.status === 'late' ? 'selected' : ''}>Late</option>
                    </select>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error updating attendance list:', error);
        showError('Failed to update attendance list');
    }
}

async function updateAttendanceStatus(attendanceId, status) {
    try {
        await apiCall(`/api/teachers/attendance/${attendanceId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        showSuccess('Attendance updated successfully');
    } catch (error) {
        console.error('Error updating attendance:', error);
        showError('Failed to update attendance');
    }
}

// Assignments functions
async function loadAssignments() {
    try {
        const response = await apiCall('/api/teachers/assignments');
        const assignments = await response.json();
        
        const assignmentsList = document.getElementById('assignments-list');
        assignmentsList.innerHTML = assignments.map(assignment => `
            <div class="assignment-card">
                <div class="assignment-header">
                    <h3 class="assignment-title">${assignment.title}</h3>
                    <span class="assignment-due">Due: ${new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                <p class="assignment-description">${assignment.description}</p>
                <div class="assignment-footer">
                    <span class="assignment-status status-${assignment.status}">${assignment.status}</span>
                    <button onclick="viewAssignmentDetails('${assignment._id}')">View Details</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading assignments:', error);
        showError('Failed to load assignments');
    }
}

async function createAssignment() {
    const form = document.getElementById('create-assignment-form');
    const formData = new FormData(form);
    
    try {
        await apiCall('/api/teachers/assignments', {
            method: 'POST',
            body: JSON.stringify({
                title: formData.get('title'),
                description: formData.get('description'),
                dueDate: formData.get('dueDate'),
                classId: formData.get('classId')
            })
        });
        
        showSuccess('Assignment created successfully');
        form.reset();
        document.getElementById('create-assignment-modal').style.display = 'none';
        loadAssignments();
    } catch (error) {
        console.error('Error creating assignment:', error);
        showError('Failed to create assignment');
    }
}

// Profile functions
async function loadProfile() {
    try {
        const response = await apiCall('/api/teachers/profile');
        const profile = await response.json();
        
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-email').textContent = profile.email;
        document.getElementById('profile-phone').textContent = profile.phone;
        document.getElementById('profile-subjects').textContent = profile.subjects.join(', ');
        document.getElementById('profile-qualification').textContent = profile.qualification;
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile');
    }
}

async function updateProfile() {
    const form = document.getElementById('update-profile-form');
    const formData = new FormData(form);
    
    try {
        await apiCall('/api/teachers/profile', {
            method: 'PUT',
            body: JSON.stringify({
                phone: formData.get('phone'),
                subjects: formData.get('subjects').split(',').map(s => s.trim()),
                qualification: formData.get('qualification')
            })
        });
        
        showSuccess('Profile updated successfully');
        form.reset();
        document.getElementById('update-profile-modal').style.display = 'none';
        loadProfile();
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile');
    }
}

// Utility functions
function showError(message) {
    // Implement error notification
    alert(message);
}

function showSuccess(message) {
    // Implement success notification
    alert(message);
} 