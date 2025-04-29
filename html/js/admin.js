// Admin Dashboard Functionality

document.addEventListener('DOMContentLoaded', () => {
    requireRole('admin');
    loadDashboard();
    loadProfile();
});

// Tab switching
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
    // Load data for the selected tab
    switch(tabName) {
        case 'students': loadStudents(); break;
        case 'teachers': loadTeachers(); break;
        case 'classes': loadClasses(); break;
        case 'dashboard': loadDashboard(); break;
        case 'profile': loadProfile(); break;
    }
}

// Dashboard (placeholder, needs backend endpoint for stats)
async function loadDashboard() {
    // For now, just count students from /api/students
    try {
        const response = await fetch('http://localhost:5000/api/students');
        const students = await response.json();
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('totalTeachers').textContent = '0';
        document.getElementById('totalClasses').textContent = '0';
        document.getElementById('totalParents').textContent = '0';
        // Activities placeholder
        const activitiesList = document.getElementById('activitiesList');
        activitiesList.innerHTML = '<li>No recent activities.</li>';
    } catch (error) {
        showError('Failed to load dashboard');
    }
}

// Students
async function loadStudents() {
    try {
        const response = await fetch('http://localhost:5000/api/students');
        const students = await response.json();
        const tableBody = document.getElementById('studentsTableBody');
        tableBody.innerHTML = '';
        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.grade || '-'}</td>
                <td>${student.section || '-'}</td>
                <td>${student.email}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-danger" onclick="deleteStudent(${student.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        showError('Failed to load students');
    }
}

// Teachers
async function loadTeachers() {
    const response = await fetch('http://localhost:5000/api/teachers');
    const teachers = await response.json();
    const tableBody = document.getElementById('teachersTableBody');
    tableBody.innerHTML = '';
    teachers.forEach(teacher => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${teacher.firstName} ${teacher.lastName}</td>
            <td>${teacher.subject}</td>
            <td>-</td>
            <td>${teacher.contact || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-danger" onclick="deleteTeacher(${teacher.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Classes (placeholder)
async function loadClasses() {
    const tableBody = document.getElementById('classesTableBody');
    tableBody.innerHTML = '<tr><td colspan="5">No classes endpoint yet.</td></tr>';
}

// Profile
function loadProfile() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('profileName').textContent = user.firstName + ' ' + user.lastName;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileRole').textContent = user.role;
        document.getElementById('userName').textContent = user.firstName + ' ' + user.lastName;
        document.getElementById('profileAvatar').textContent = user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase();
        document.getElementById('userAvatar').textContent = user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase();
    }
}

// Modal logic
function addStudent() {
    document.getElementById('addStudentModal').style.display = 'block';
}
function addTeacher() {
    document.getElementById('addTeacherModal').style.display = 'block';
}
function addClass() {
    document.getElementById('addClassModal').style.display = 'block';
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Form submissions (placeholders)
document.getElementById('addStudentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const firstName = document.getElementById('studentFirstName').value.trim();
    const lastName = document.getElementById('studentLastName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const grade = document.getElementById('studentGrade').value.trim();
    const section = document.getElementById('studentSection').value.trim();
    const username = email.split('@')[0];
    const password = 'student123';

    if (!firstName || !lastName || !email) {
        showError('Please fill all required fields.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, firstName, lastName, grade, section })
        });
        if (response.ok) {
            showSuccess('Student added!');
            closeModal('addStudentModal');
            loadStudents();
        } else {
            const data = await response.json();
            showError(data.message || 'Failed to add student.');
        }
    } catch (err) {
        showError('Failed to add student.');
    }
});
document.getElementById('addTeacherForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const firstName = document.getElementById('teacherFirstName').value.trim();
    const lastName = document.getElementById('teacherLastName').value.trim();
    const email = document.getElementById('teacherEmail').value.trim();
    const subject = document.getElementById('teacherSubject').value.trim();
    const contact = document.getElementById('teacherContact').value.trim();
    if (!firstName || !lastName || !email || !subject) {
        showError('Please fill all required fields.');
        return;
    }
    const response = await fetch('http://localhost:5000/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, subject, contact })
    });
    if (response.ok) {
        showSuccess('Teacher added!');
        closeModal('addTeacherModal');
        loadTeachers();
    } else {
        const data = await response.json();
        showError(data.message || 'Failed to add teacher.');
    }
});
document.getElementById('addClassForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    showError('Add class not implemented yet.');
});

// Utility
function showError(message) {
    alert(message);
}
function showSuccess(message) {
    alert(message);
}

async function deleteTeacher(id) {
    if (!confirm('Delete this teacher?')) return;
    const response = await fetch(`http://localhost:5000/api/teachers/${id}`, { method: 'DELETE' });
    if (response.ok) {
        showSuccess('Teacher deleted!');
        loadTeachers();
    } else {
        showError('Failed to delete teacher.');
    }
} 