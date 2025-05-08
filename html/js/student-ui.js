// Student Dashboard UI Functions
const studentData = {
    stats: {
        attendance: 95,
        pendingAssignments: 3,
        upcomingTests: 2,
        averageGrade: 88
    },
    schedule: {
        Monday: [
            { time: '8:00 AM - 9:30 AM', subject: 'Mathematics', room: '301', teacher: 'Mr. Johnson' },
            { time: '9:45 AM - 11:15 AM', subject: 'Physics', room: '205', teacher: 'Ms. Thompson' },
            { time: '11:30 AM - 1:00 PM', subject: 'English Literature', room: '102', teacher: 'Mrs. Davis' }
        ],
        Tuesday: [
            { time: '8:00 AM - 9:30 AM', subject: 'Biology', room: '401', teacher: 'Dr. Miller' },
            { time: '9:45 AM - 11:15 AM', subject: 'History', room: '103', teacher: 'Mr. Anderson' }
        ]
    },
    assignments: [
        {
            subject: 'Mathematics',
            title: 'Mathematics Assignment',
            description: 'Complete exercises 5-10 from Chapter 4: Quadratic Equations',
            dueDate: 'Tomorrow',
            status: 'warning'
        },
        {
            subject: 'Physics',
            title: 'Physics Lab Report',
            description: 'Write a detailed report on the Light Refraction experiment',
            dueDate: 'Submitted',
            status: 'success'
        }
    ],
    grades: [
        { subject: 'Mathematics', score: 92, status: 'Excellent' },
        { subject: 'Physics', score: 85, status: 'Good' }
    ],
    attendance: {
        present: 85,
        absent: 3,
        late: 2,
        rate: 95
    }
};

// Toast notification function
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Update dashboard stats
function updateDashboardStats() {
    const stats = studentData.stats;
    
    // Update attendance rate
    const attendanceCard = document.querySelector('.stat-card:nth-child(1)');
    if (attendanceCard) {
        attendanceCard.querySelector('p').textContent = `${stats.attendance}%`;
        attendanceCard.querySelector('.progress-fill').style.width = `${stats.attendance}%`;
    }
    
    // Update pending assignments
    const assignmentsCard = document.querySelector('.stat-card:nth-child(2)');
    if (assignmentsCard) {
        assignmentsCard.querySelector('p').textContent = stats.pendingAssignments;
    }
    
    // Update upcoming tests
    const testsCard = document.querySelector('.stat-card:nth-child(3)');
    if (testsCard) {
        testsCard.querySelector('p').textContent = stats.upcomingTests;
    }
    
    // Update average grade
    const gradeCard = document.querySelector('.stat-card:nth-child(4)');
    if (gradeCard) {
        gradeCard.querySelector('p').textContent = `${stats.averageGrade}%`;
        gradeCard.querySelector('.progress-fill').style.width = `${stats.averageGrade}%`;
    }
}

// Assignment Functions
function viewAssignment(assignmentId) {
    const assignment = studentData.assignments.find(a => a.title === assignmentId);
    if (!assignment) return;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${assignment.title}</h2>
                <button class="close-modal" onclick="closeModal(this.closest('.modal'))">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Subject:</strong> ${assignment.subject}</p>
                <p><strong>Due Date:</strong> ${assignment.dueDate}</p>
                <p><strong>Status:</strong> <span class="status ${assignment.status}">${assignment.status === 'warning' ? 'Pending' : 'Submitted'}</span></p>
                <div class="assignment-description">
                    <h3>Description</h3>
                    <p>${assignment.description}</p>
                </div>
                ${assignment.status === 'warning' ? `
                    <div class="file-upload">
                        <h3>Submit Assignment</h3>
                        <input type="file" id="assignment-file" class="form-control">
                        <p class="help-text">Accepted formats: .pdf, .doc, .docx</p>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                ${assignment.status === 'warning' ? `
                    <button class="btn btn-primary" onclick="submitAssignment('${assignment.title}')">
                        <i class="fas fa-upload"></i> Submit
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="closeModal(this.closest('.modal'))">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function submitAssignment(assignmentId) {
    const fileInput = document.getElementById('assignment-file');
    if (!fileInput || !fileInput.files.length) {
        showToast('Please select a file to upload', 'warning');
        return;
    }

    const file = fileInput.files[0];
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
        showToast('Invalid file format. Please upload PDF or Word document', 'error');
        return;
    }

    // Simulate file upload
    const modal = fileInput.closest('.modal');
    const submitBtn = modal.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;

    setTimeout(() => {
        // Update assignment status
        const assignment = studentData.assignments.find(a => a.title === assignmentId);
        if (assignment) {
            assignment.status = 'success';
            assignment.dueDate = 'Submitted';
        }

        // Update UI
        updateAssignmentsList();
        closeModal(modal);
        showToast('Assignment submitted successfully!', 'success');
    }, 2000);
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
}

function updateAssignmentsList() {
    const assignmentsContainer = document.querySelector('#assignments .cards-grid');
    if (!assignmentsContainer) return;

    assignmentsContainer.innerHTML = studentData.assignments.map(assignment => `
        <div class="card">
            <div class="assignment-header">
                <h3>${assignment.title}</h3>
                <span class="status ${assignment.status}">${assignment.status === 'warning' ? 'Due Tomorrow' : 'Submitted'}</span>
            </div>
            <p>${assignment.description}</p>
            <div class="card-actions">
                ${assignment.status === 'warning' ? `
                    <button class="btn btn-primary" onclick="viewAssignment('${assignment.title}')">
                        <i class="fas fa-upload"></i> Submit Assignment
                    </button>
                ` : `
                    <button class="btn btn-secondary" onclick="viewAssignment('${assignment.title}')">
                        <i class="fas fa-eye"></i> View Submission
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Add styles for modal
const modalStyles = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .modal.show {
        display: block;
        opacity: 1;
    }

    .modal-content {
        position: relative;
        background: white;
        width: 90%;
        max-width: 600px;
        margin: 2rem auto;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
        transform: translateY(-20px);
        transition: transform 0.3s ease;
    }

    .modal.show .modal-content {
        transform: translateY(0);
    }

    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--gray-200);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--text-dark);
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.5rem;
    }

    .close-modal:hover {
        color: var(--text-dark);
    }

    .modal-body {
        padding: 1.5rem;
    }

    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid var(--gray-200);
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .file-upload {
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: var(--gray-100);
        border-radius: var(--border-radius);
    }

    .file-upload h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: var(--text-dark);
    }

    .help-text {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: var(--text-muted);
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .fa-spinner {
        animation: spin 1s linear infinite;
    }
`;

// Add logout button styles
const additionalStyles = `
    .btn-logout {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: transparent;
        color: var(--text-dark);
        border: 1px solid var(--gray-300);
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.875rem;
    }

    .btn-logout:hover {
        background-color: var(--danger);
        color: var(--text-light);
        border-color: var(--danger);
    }

    .btn-logout i {
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        .btn-logout span {
            display: none;
        }

        .btn-logout {
            padding: 0.5rem;
        }

        .btn-logout i {
            margin: 0;
        }
    }

    .confirm-modal .modal-content {
        max-width: 400px;
    }

    .confirm-modal .modal-body {
        text-align: center;
        padding: 2rem 1.5rem;
    }

    .confirm-modal .modal-footer {
        justify-content: center;
    }

    .btn-danger {
        background-color: var(--danger);
        color: var(--text-light);
    }

    .btn-danger:hover {
        background-color: #dc2626;
    }
`;

// Update the style injection
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles + additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Update initial stats
    updateDashboardStats();
    updateAssignmentsList();
    
    // Show welcome toast
    showToast('Welcome to your dashboard!', 'success');
    
    // Initialize tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

// Logout function
function logout() {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal confirm-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Confirm Logout</h2>
                <button class="close-modal" onclick="closeModal(this.closest('.modal'))">&times;</button>
            </div>
            <div class="modal-body">
                <i class="fas fa-sign-out-alt" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
                <p>Are you sure you want to logout?</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" onclick="confirmLogout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
                <button class="btn btn-secondary" onclick="closeModal(this.closest('.modal'))">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function confirmLogout() {
    // Show loading state
    const modal = document.querySelector('.confirm-modal');
    const logoutBtn = modal.querySelector('.btn-danger');
    logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
    logoutBtn.disabled = true;

    // Simulate logout process
    setTimeout(() => {
        // Clear any stored session data
        sessionStorage.clear();
        localStorage.removeItem('studentSession');

        // Show success message
        showToast('Logging out...', 'info');

        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }, 1000);
}

// Export for use in other files if needed
window.studentData = studentData;
window.updateDashboardStats = updateDashboardStats;
window.viewAssignment = viewAssignment;
window.submitAssignment = submitAssignment;
window.closeModal = closeModal;
window.logout = logout;
window.confirmLogout = confirmLogout; 