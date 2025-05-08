// Initialize the API client
const api = new StudentAPI();

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'student') {
        window.location.href = 'login.html';
        return;
    }
    
    initializeDashboard();
    setupTabNavigation();
    setupAssignmentModal();
});

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Load user profile
        const profile = await api.getProfile();
        if (!profile) {
            throw new Error('Failed to load user profile');
        }

        // Update student name in header
        document.getElementById('studentName').textContent = profile.full_name;

        // Load dashboard data
        await Promise.all([
            loadProfileCard(profile),
            loadAttendanceCard(),
            loadAssignmentsCard(),
            loadGradesCard(),
            loadTodaySchedule()
        ]);

    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        if (error.message.includes('authentication') || error.message.includes('401')) {
            window.location.href = 'login.html';
        }
    }
}

// Setup assignment modal
function setupAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    const fileInput = document.getElementById('assignmentFile');
    const selectedFileDiv = document.getElementById('selectedFile');
    const fileNameSpan = document.getElementById('fileName');
    const submitForm = document.getElementById('submitForm');

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            selectedFileDiv.style.display = 'flex';
        }
    });

    // Handle form submission
    submitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const assignmentId = submitForm.dataset.assignmentId;
        await submitAssignment(assignmentId);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSubmitModal();
        }
    });
}

// Load profile card
async function loadProfileCard(profile) {
    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
        <div class="profile-details">
            <p><strong>Name:</strong> ${profile.full_name}</p>
            <p><strong>Grade:</strong> ${profile.grade}-${profile.section}</p>
            <p><strong>Email:</strong> ${profile.email}</p>
            <p><strong>Student ID:</strong> ${profile.id}</p>
        </div>
    `;
}

// Load attendance card
async function loadAttendanceCard() {
    try {
        const attendance = await api.getAttendance();
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'present').length;
        const attendanceRate = totalDays ? (presentDays / totalDays * 100).toFixed(1) : 0;

        document.getElementById('attendanceRate').innerHTML = `
            <div class="stat-value">${attendanceRate}%</div>
            <div class="stat-label">Present Days: ${presentDays}/${totalDays}</div>
        `;
    } catch (error) {
        document.getElementById('attendanceRate').innerHTML = 'Failed to load attendance data';
        console.error('Failed to load attendance:', error);
    }
}

// Load assignments card
async function loadAssignmentsCard() {
    try {
        const assignments = await api.getAssignments();
        const pending = assignments.filter(a => a.status === 'pending').length;
        const total = assignments.length;

        document.getElementById('pendingAssignments').innerHTML = `
            <div class="stat-value">${pending}</div>
            <div class="stat-label">Total Assignments: ${total}</div>
        `;
    } catch (error) {
        document.getElementById('pendingAssignments').innerHTML = 'Failed to load assignments data';
        console.error('Failed to load assignments:', error);
    }
}

// Load grades card
async function loadGradesCard() {
    try {
        const grades = await api.getGrades();
        const validGrades = grades.filter(g => g.score !== null);
        const average = validGrades.length ? 
            (validGrades.reduce((sum, g) => sum + (g.score / g.max_score * 100), 0) / validGrades.length).toFixed(1) : 
            0;

        document.getElementById('averageGrade').innerHTML = `
            <div class="stat-value">${average}%</div>
            <div class="stat-label">Total Subjects: ${validGrades.length}</div>
        `;
    } catch (error) {
        document.getElementById('averageGrade').innerHTML = 'Failed to load grades data';
        console.error('Failed to load grades:', error);
    }
}

// Load today's schedule
async function loadTodaySchedule() {
    try {
        const schedule = await api.getSchedule();
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const todayClasses = schedule.filter(c => c.day.toLowerCase() === today);

        const scheduleHtml = todayClasses.length ? todayClasses.map(c => `
            <div class="schedule-item">
                <div class="schedule-time">${c.start_time} - ${c.end_time}</div>
                <div class="schedule-details">
                    <div class="subject">${c.subject}</div>
                    <div class="teacher">Teacher: ${c.teacher_name}</div>
                    <div class="room">Room: ${c.room}</div>
                </div>
            </div>
        `).join('') : '<p>No classes scheduled for today</p>';

        document.getElementById('todaySchedule').innerHTML = scheduleHtml;
    } catch (error) {
        document.getElementById('todaySchedule').innerHTML = 'Failed to load schedule data';
        console.error('Failed to load schedule:', error);
    }
}

// Setup tab navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');

            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            // Load tab-specific content
            loadTabContent(targetId);
        });
    });
}

// Load content for specific tabs
async function loadTabContent(tabId) {
    try {
        switch (tabId) {
            case 'schedule':
                await loadWeeklySchedule();
                break;
            case 'assignments':
                await loadAssignmentsList();
                break;
            case 'grades':
                await loadGradesOverview();
                break;
            case 'attendance':
                await loadAttendanceRecords();
                break;
        }
    } catch (error) {
        console.error(`Failed to load ${tabId} content:`, error);
    }
}

// Load weekly schedule
async function loadWeeklySchedule() {
    try {
        const schedule = await api.getSchedule();
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        const scheduleHtml = weekDays.map(day => {
            const dayClasses = schedule.filter(c => c.day === day);
            return `
                <div class="schedule-day">
                    <h3>${day}</h3>
                    ${dayClasses.length ? dayClasses.map(c => `
                        <div class="schedule-item">
                            <div class="schedule-time">${c.start_time} - ${c.end_time}</div>
                            <div class="schedule-details">
                                <div class="subject">${c.subject}</div>
                                <div class="teacher">Teacher: ${c.teacher_name}</div>
                                <div class="room">Room: ${c.room}</div>
                            </div>
                        </div>
                    `).join('') : '<p>No classes scheduled</p>'}
                </div>
            `;
        }).join('');

        document.getElementById('weeklySchedule').innerHTML = scheduleHtml;
    } catch (error) {
        document.getElementById('weeklySchedule').innerHTML = 'Failed to load schedule data';
        console.error('Failed to load weekly schedule:', error);
    }
}

// Load assignments list
async function loadAssignmentsList() {
    try {
        const assignments = await api.getAssignments();
        
        // Setup filter buttons
        const filters = document.querySelectorAll('.filter-btn');
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                filterAssignments(assignments, filter.getAttribute('data-filter'));
            });
        });

        // Initial load with all assignments
        filterAssignments(assignments, 'all');
    } catch (error) {
        document.getElementById('assignmentsList').innerHTML = 'Failed to load assignments data';
        console.error('Failed to load assignments list:', error);
    }
}

// Filter assignments based on status
function filterAssignments(assignments, filter) {
    const assignmentsList = document.getElementById('assignmentsList');
    const filteredAssignments = filter === 'all' 
        ? assignments 
        : assignments.filter(a => a.status.toLowerCase() === filter.toLowerCase());

    if (filteredAssignments.length === 0) {
        assignmentsList.innerHTML = '<div class="no-data">No assignments found</div>';
        return;
    }

    assignmentsList.innerHTML = filteredAssignments.map(assignment => `
        <div class="assignment-item">
            <div class="assignment-header">
                <h3>${assignment.title}</h3>
                <span class="status ${assignment.status.toLowerCase()}">${assignment.status}</span>
            </div>
            <div class="assignment-details">
                <p class="assignment-subject">Subject: ${assignment.class_name || 'Not specified'}</p>
                <p>${assignment.description}</p>
                <div class="assignment-meta">
                    <span><i class="fas fa-calendar"></i> Due: ${new Date(assignment.due_date).toLocaleDateString()}</span>
                    ${assignment.grade !== null 
                        ? `<span class="grade"><i class="fas fa-star"></i> Grade: ${assignment.grade}/${assignment.max_grade}</span>`
                        : ''}
                </div>
                ${assignment.feedback 
                    ? `<div class="feedback">
                        <p><strong>Teacher's Feedback:</strong></p>
                        <p>${assignment.feedback}</p>
                       </div>`
                    : ''}
                ${assignment.status.toLowerCase() === 'pending' 
                    ? `<div class="assignment-actions">
                        <button class="btn-primary" onclick="submitAssignment(${assignment.id})" data-assignment-id="${assignment.id}">
                            Submit Assignment
                        </button>
                       </div>`
                    : ''}
            </div>
        </div>
    `).join('');
}

// Load grades overview
async function loadGradesOverview() {
    try {
        const grades = await api.getGrades();
        
        const gradesHtml = grades.length ? grades.map(g => `
            <div class="grade-item">
                <div class="subject-info">
                    <div class="subject-name">${g.subject || 'Unknown Subject'}</div>
                    <div class="score-badge ${getScoreClass(g.score, g.max_score)}">
                        Score: ${g.score !== null ? g.score : 'N/A'}/${g.max_score}
                    </div>
                </div>
                <div class="grade-details">
                    <div class="percentage ${getScoreClass(g.score, g.max_score)}">
                        ${g.score !== null ? ((g.score / g.max_score) * 100).toFixed(1) : 'N/A'}%
                    </div>
                    <div class="date-info">
                        ${g.created_at ? `Graded on: ${new Date(g.created_at).toLocaleDateString()}` : ''}
                    </div>
                </div>
            </div>
        `).join('') : '<p class="no-data">No grades available</p>';

        // Add styles for the new grade items
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .grade-item {
                background: #fff;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
            }
            
            .grade-item:hover {
                transform: translateY(-2px);
            }
            
            .subject-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .subject-name {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-dark);
            }
            
            .score-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .grade-details {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .percentage {
                font-size: 1.2rem;
                font-weight: 600;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }
            
            .date-info {
                font-size: 0.85rem;
                color: #666;
            }
            
            .excellent {
                background: #e3fcef;
                color: #0a6245;
            }
            
            .good {
                background: #e3f2fd;
                color: #0d47a1;
            }
            
            .average {
                background: #fff3e0;
                color: #e65100;
            }
            
            .poor {
                background: #ffebee;
                color: #c62828;
            }
            
            .no-data {
                text-align: center;
                padding: 2rem;
                color: #666;
                font-style: italic;
            }
        `;
        document.head.appendChild(styleElement);

        document.getElementById('gradesOverview').innerHTML = gradesHtml;
    } catch (error) {
        document.getElementById('gradesOverview').innerHTML = 'Failed to load grades data';
        console.error('Failed to load grades overview:', error);
    }
}

// Helper function to determine score class
function getScoreClass(score, maxScore) {
    if (score === null) return '';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 70) return 'average';
    return 'poor';
}

// Load attendance records
async function loadAttendanceRecords() {
    try {
        // Setup date filter
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        const filterBtn = document.getElementById('filterAttendance');

        // Set default date range (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
        startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
        endDate.value = new Date().toISOString().split('T')[0];

        // Load initial attendance data
        await filterAttendanceRecords();

        // Setup filter button click handler
        filterBtn.addEventListener('click', filterAttendanceRecords);
    } catch (error) {
        document.getElementById('attendanceRecords').innerHTML = 'Failed to load attendance data';
        console.error('Failed to load attendance records:', error);
    }
}

// Filter attendance records by date range
async function filterAttendanceRecords() {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const attendanceRecords = document.getElementById('attendanceRecords');
        
        attendanceRecords.innerHTML = '<div class="loading-message">Loading attendance records...</div>';
        
        const attendance = await api.getAttendance({ startDate, endDate });
        
        if (attendance.length === 0) {
            attendanceRecords.innerHTML = '<div class="error-message">No attendance records found for the selected period</div>';
            return;
        }

        const attendanceHtml = attendance.map(record => `
            <div class="attendance-item">
                <div class="date">${new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}</div>
                <div class="status ${record.status.toLowerCase()}">${record.status}</div>
                ${record.note ? `<div class="note">${record.note}</div>` : ''}
            </div>
        `).join('');

        attendanceRecords.innerHTML = attendanceHtml;
    } catch (error) {
        console.error('Failed to filter attendance records:', error);
        document.getElementById('attendanceRecords').innerHTML = 
            '<div class="error-message">Failed to load attendance data</div>';
    }
}

// Add modal styles immediately when the script loads
function addModalStyles() {
    // Remove existing modal styles if any
    const existingStyles = document.getElementById('modalStyles');
    if (existingStyles) {
        existingStyles.remove();
    }

    const modalStyles = document.createElement('style');
    modalStyles.id = 'modalStyles';
    modalStyles.textContent = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .modal-content {
            background: #ffffff;
            padding: 2rem;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            position: relative;
        }

        .modal-content h2 {
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
        }

        .submit-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .form-group label {
            font-weight: 600;
            color: var(--text-dark);
        }

        .form-group input[type="file"] {
            padding: 1rem;
            border: 2px dashed var(--primary-color);
            border-radius: 8px;
            background: #f8f9fa;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .form-group input[type="file"]:hover {
            background: #eef1f6;
            border-color: var(--secondary-color);
        }

        .form-group textarea {
            padding: 1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            resize: vertical;
            min-height: 100px;
            font-family: inherit;
            transition: border-color 0.3s ease;
        }

        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }

        .btn-secondary {
            background: #e9ecef;
            color: var(--text-dark);
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: #dee2e6;
        }

        .btn-primary {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            background: var(--secondary-color);
        }

        .btn-primary:disabled {
            background: #b8b8b8;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(modalStyles);
}

// Call addModalStyles when the page loads
document.addEventListener('DOMContentLoaded', addModalStyles);

// Function to submit an assignment
async function submitAssignment(assignmentId) {
    try {
        // Get modal and check if it exists
        const modal = document.getElementById('assignmentModal');
        if (!modal) {
            console.error('Modal element not found');
            alert('Could not open submission form. Please try again.');
            return;
        }

        // Show modal
        modal.style.display = 'flex';

        // Get form elements and check if they exist
        const form = document.getElementById('submitForm');
        const fileInput = document.getElementById('assignmentFile');
        const selectedFileDiv = document.getElementById('selectedFile');
        const fileNameSpan = document.getElementById('fileName');

        if (!form || !fileInput || !selectedFileDiv || !fileNameSpan) {
            console.error('Required form elements not found');
            alert('Could not initialize submission form. Please try again.');
            return;
        }

        // Set the assignment ID on the form
        form.dataset.assignmentId = assignmentId;
        console.log('Set assignment ID:', assignmentId); // Debug log

        // Handle file selection
        fileInput.onchange = function() {
            if (this.files && this.files[0]) {
                fileNameSpan.textContent = this.files[0].name;
                selectedFileDiv.style.display = 'flex';
            }
        };

        // Handle form submission
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const notesInput = document.getElementById('notes');
            if (!notesInput) {
                console.error('Notes input not found');
                return;
            }
            
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Please select a file to upload');
                return;
            }

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) {
                console.error('Submit button not found');
                return;
            }

            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitButton.disabled = true;

            try {
                // Get the assignment ID from the form's dataset
                const currentAssignmentId = form.dataset.assignmentId;
                console.log('Submitting assignment ID:', currentAssignmentId); // Debug log

                if (!currentAssignmentId) {
                    throw new Error('No assignment ID found');
                }

                // Create FormData and append file and notes
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                formData.append('notes', notesInput.value);
                
                // Submit the assignment
                const result = await api.submitAssignment(
                    currentAssignmentId,
                    formData
                );
                
                // Close modal and show success message
                closeSubmitModal();
                alert('Assignment submitted successfully!');
                
                // Refresh assignments list
                await loadAssignmentsList();
            } catch (error) {
                alert(error.message || 'Failed to submit assignment');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        };

        // Handle click outside modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSubmitModal();
            }
        });

    } catch (error) {
        console.error('Error in submitAssignment:', error);
        alert(error.message || 'Failed to submit assignment');
    }
}

// Function to close the submit modal
function closeSubmitModal() {
    try {
        const modal = document.getElementById('assignmentModal');
        const form = document.getElementById('submitForm');
        const selectedFileDiv = document.getElementById('selectedFile');
        
        if (!modal || !form || !selectedFileDiv) {
            console.error('Required elements not found for closing modal');
            return;
        }
        
        // Reset form
        form.reset();
        selectedFileDiv.style.display = 'none';
        
        // Hide modal
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error in closeSubmitModal:', error);
    }
}

// Function to remove selected file
function removeSelectedFile() {
    try {
        const fileInput = document.getElementById('assignmentFile');
        const selectedFileDiv = document.getElementById('selectedFile');
        
        if (!fileInput || !selectedFileDiv) {
            console.error('Required elements not found for removing file');
            return;
        }
        
        fileInput.value = '';
        selectedFileDiv.style.display = 'none';
    } catch (error) {
        console.error('Error in removeSelectedFile:', error);
    }
}

// Enable drag and drop for file input
document.addEventListener('DOMContentLoaded', () => {
    try {
        const fileInputContainer = document.querySelector('.file-input-container');
        const fileInput = document.getElementById('assignmentFile');

        if (!fileInputContainer || !fileInput) {
            console.error('Required elements not found for drag and drop');
            return;
        }

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileInputContainer.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileInputContainer.addEventListener(eventName, () => {
                fileInputContainer.style.background = '#eef1f6';
                fileInputContainer.style.borderColor = 'var(--secondary-color)';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileInputContainer.addEventListener(eventName, () => {
                fileInputContainer.style.background = '#f8f9fa';
                fileInputContainer.style.borderColor = 'var(--primary-color)';
            });
        });

        fileInputContainer.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;
            
            if (files && files[0]) {
                const fileNameSpan = document.getElementById('fileName');
                const selectedFileDiv = document.getElementById('selectedFile');
                
                if (fileNameSpan && selectedFileDiv) {
                    fileNameSpan.textContent = files[0].name;
                    selectedFileDiv.style.display = 'flex';
                }
            }
        });
    } catch (error) {
        console.error('Error setting up drag and drop:', error);
    }
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format datetime for display
function formatDateTime(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Make notification visible with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add event listener to close button
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
} 