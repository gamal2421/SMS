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
        { 
            id: 'message-attendance', 
            from: 'Mrs. Sarah Parker', 
            subject: 'Attendance Update', 
            date: '2024-03-18', 
            read: false 
        },
        { 
            id: 'message-science-club', 
            from: 'Dr. Robert Chen', 
            subject: 'Science Club Competition', 
            date: '2024-03-16', 
            read: false 
        },
        { 
            id: 'message-career-day', 
            from: 'Ms. Emily Brooks', 
            subject: 'Career Day Invitation', 
            date: '2024-03-15', 
            read: true 
        }
    ]
};

// Parent Dashboard UI Class
class ParentUI {
    constructor() {
        this.baseUrl = '/school_api';
        this.parent = null;
        this.children = [];
        this.activeChildId = null;
        this.activeTab = 'dashboard';
    }
    
    // Initialize the parent dashboard
    async init() {
        try {
            // Check authentication
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                window.location.href = 'login.html';
                return;
            }
            
            // Load parent profile
            const response = await this.apiRequest(`/parent/${userId}`);
            this.parent = response;
            
            // Update parent name and avatar
            document.getElementById('userName').textContent = this.parent.full_name;
            const initials = this.parent.full_name
                .split(' ')
                .map(name => name.charAt(0))
                .join('');
            document.getElementById('userAvatar').textContent = initials;
            
            // Load children data
            await this.loadChildren();
            
            // Load dashboard content
            this.loadDashboardContent();
            
            // Set up event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Error', 'Failed to initialize dashboard', 'error');
        }
    }
    
    // Load parent's children data
    async loadChildren() {
        try {
            const response = await this.apiRequest('/parent/children');
            this.children = response;
            
            if (this.children.length > 0) {
                this.activeChildId = this.children[0].id;
                this.renderChildrenOverview();
            } else {
                document.getElementById('children-overview').innerHTML = 
                    '<p class="no-data">No children registered</p>';
            }
        } catch (error) {
            console.error('Error loading children:', error);
            this.showNotification('Error', 'Failed to load children data', 'error');
        }
    }
    
    // Render the children overview in the dashboard
    renderChildrenOverview() {
        const container = document.getElementById('children-overview');
        container.innerHTML = '';
        
        this.children.forEach(child => {
            // Calculate attendance and grade percentages
            const attendancePercent = child.attendance_rate || 0;
            const gradePercent = child.average_grade || 0;
            
            const childCard = document.createElement('div');
            childCard.className = 'card child-card';
            childCard.dataset.childId = child.id;
            
            childCard.innerHTML = `
            <div class="student-header">
                    <div class="student-avatar">${this.getInitials(child.full_name)}</div>
                <div class="student-info">
                        <h3>${child.full_name}</h3>
                        <p>Grade ${child.grade || ''}-${child.section || ''}</p>
                </div>
            </div>
            <div class="student-stats">
                <div class="stat">
                    <label>Attendance</label>
                        <span>${attendancePercent}%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${attendancePercent}%"></div>
                        </div>
                </div>
                <div class="stat">
                    <label>Average Grade</label>
                        <span>${gradePercent}%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${gradePercent}%"></div>
                </div>
            </div>
        </div>
                <div class="card-actions">
                    <button class="btn btn-primary view-details-btn" data-child-id="${child.id}">
                        View Details
                    </button>
                </div>
            `;
            
            container.appendChild(childCard);
            
            // Add click event for the view details button
            childCard.querySelector('.view-details-btn').addEventListener('click', () => {
                this.activeChildId = child.id;
                this.openTab('academics');
                this.loadChildAcademics(child.id);
            });
        });
    }
    
    // Load dashboard content
    async loadDashboardContent() {
        try {
            // Load announcements
            const announcements = await this.apiRequest('/parent/announcements');
            this.renderAnnouncements(announcements);
            
            // Load upcoming events
            const events = await this.apiRequest('/parent/events');
            this.renderEvents(events);
            
        } catch (error) {
            console.error('Error loading dashboard content:', error);
        }
    }
    
    // Render school announcements
    renderAnnouncements(announcements) {
        const container = document.getElementById('announcements-list');
        container.innerHTML = '';
        
        if (!announcements || announcements.length === 0) {
            container.innerHTML = '<p class="no-data">No announcements</p>';
            return;
        }
        
        announcements.forEach(announcement => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Priority colors
            const priorityClass = this.getPriorityClass(announcement.priority);
            
            card.innerHTML = `
                <div class="announcement-header ${priorityClass}">
                <h3>${announcement.title}</h3>
                    <span class="announcement-date">${this.formatDate(announcement.date)}</span>
            </div>
            <p>${announcement.content}</p>
            `;
            
            container.appendChild(card);
        });
    }
    
    // Render upcoming events
    renderEvents(events) {
        const container = document.getElementById('events-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!events || events.length === 0) {
            container.innerHTML = '<p class="no-data">No upcoming events</p>';
            return;
        }
        
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'card event-card';
            
            card.innerHTML = `
                <div class="event-date">
                    <span class="event-month">${this.getMonthAbbr(event.date)}</span>
                    <span class="event-day">${this.getDayOfMonth(event.date)}</span>
                </div>
                <div class="event-details">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="event-info">
                        <span><i class="fas fa-clock"></i> ${event.time}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
            </div>
        </div>
    `;

            container.appendChild(card);
        });
    }
    
    // Load academic information for a specific child
    async loadChildAcademics(childId) {
        try {
            // Get the child's academic data
            const academicData = await this.apiRequest(`/parent/child/${childId}/academics`);
            
            // Clear the academics container
            const container = document.getElementById('academics-container');
            container.innerHTML = '';
            
            // Add child selector if there are multiple children
            if (this.children.length > 1) {
                const selector = this.createChildSelector();
                container.appendChild(selector);
            }
            
            // Add grades section
            const gradesSection = this.createGradesSection(academicData.grades);
            container.appendChild(gradesSection);
            
            // Add recent assignments section
            const assignmentsSection = this.createAssignmentsSection(academicData.assignments);
            container.appendChild(assignmentsSection);
            
        } catch (error) {
            console.error('Error loading child academics:', error);
            this.showNotification('Error', 'Failed to load academic data', 'error');
        }
    }
    
    // Create child selector dropdown
    createChildSelector() {
        const selector = document.createElement('div');
        selector.className = 'child-selector';
        
        const label = document.createElement('label');
        label.textContent = 'Select Child:';
        
        const select = document.createElement('select');
        select.id = 'childSelect';
        
        this.children.forEach(child => {
            const option = document.createElement('option');
            option.value = child.id;
            option.textContent = child.full_name;
            if (child.id === this.activeChildId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            this.activeChildId = e.target.value;
            this.loadChildAcademics(this.activeChildId);
        });
        
        selector.appendChild(label);
        selector.appendChild(select);
        
        return selector;
    }
    
    // Create grades section
    createGradesSection(grades) {
        const section = document.createElement('div');
        section.className = 'grades-section';
        
        const title = document.createElement('h2');
        title.textContent = 'Grades';
        section.appendChild(title);
        
        const gradesGrid = document.createElement('div');
        gradesGrid.className = 'grades-grid';
        
        if (!grades || Object.keys(grades).length === 0) {
            const noData = document.createElement('p');
            noData.className = 'no-data';
            noData.textContent = 'No grades available';
            section.appendChild(noData);
            return section;
        }
        
        // Create a card for each subject
        for (const [subject, gradeData] of Object.entries(grades)) {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Create subject header
            const subjectHeader = document.createElement('h3');
            subjectHeader.textContent = subject;
            card.appendChild(subjectHeader);
            
            // Create grade chart
            const chart = document.createElement('div');
            chart.className = 'grades-chart';
            
            gradeData.assessments.forEach(assessment => {
                const bar = document.createElement('div');
                bar.className = 'grade-bar';
                bar.style.height = `${assessment.percentage}%`;
                
                const value = document.createElement('span');
                value.className = 'grade-value';
                value.textContent = `${assessment.percentage}%`;
                
                bar.appendChild(value);
                chart.appendChild(bar);
            });
            
            card.appendChild(chart);
            
            // Add average
            const average = document.createElement('p');
            average.innerHTML = `<strong>Average:</strong> ${gradeData.average}%`;
            card.appendChild(average);
            
            gradesGrid.appendChild(card);
        }
        
        section.appendChild(gradesGrid);
        return section;
    }
    
    // Create assignments section
    createAssignmentsSection(assignments) {
        const section = document.createElement('div');
        section.className = 'assignments-section';
        
        const title = document.createElement('h2');
        title.textContent = 'Recent Assignments';
        section.appendChild(title);
        
        if (!assignments || assignments.length === 0) {
            const noData = document.createElement('p');
            noData.className = 'no-data';
            noData.textContent = 'No recent assignments';
            section.appendChild(noData);
            return section;
        }
        
        const table = document.createElement('table');
        table.className = 'assignments-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Subject</th>
                <th>Assignment</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Grade</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        assignments.forEach(assignment => {
            const row = document.createElement('tr');
            
            // Determine status class
            let statusClass = 'status-pending';
            if (assignment.status === 'Completed') {
                statusClass = 'status-completed';
            } else if (assignment.status === 'Late') {
                statusClass = 'status-late';
            }
            
            row.innerHTML = `
                <td>${assignment.subject}</td>
                <td>${assignment.title}</td>
                <td>${this.formatDate(assignment.due_date)}</td>
                <td><span class="status-badge ${statusClass}">${assignment.status}</span></td>
                <td>${assignment.grade || 'N/A'}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        section.appendChild(table);
        
        return section;
    }
    
    // Tab navigation
    openTab(tabName) {
        this.activeTab = tabName;
        
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Show the selected tab
        document.getElementById(tabName).style.display = 'block';
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to the clicked button
        document.querySelector(`.tab-btn[onclick="openTab('${tabName}')"]`).classList.add('active');
        
        // Load tab-specific content
        switch(tabName) {
            case 'dashboard':
                this.loadDashboardContent();
                break;
            case 'academics':
                if (this.activeChildId) {
                    this.loadChildAcademics(this.activeChildId);
                }
                break;
            case 'schedule':
                this.loadSchedule();
                break;
            case 'fees':
                this.loadFees();
                break;
            case 'communications':
                this.loadCommunications();
                break;
        }
    }
    
    // Load schedule tab
    async loadSchedule() {
        try {
            if (!this.activeChildId) {
                if (this.children.length > 0) {
                    this.activeChildId = this.children[0].id;
                } else {
                    document.getElementById('schedule').innerHTML = 
                        '<p class="no-data">No children registered</p>';
                    return;
                }
            }
            
            const schedule = await this.apiRequest(`/parent/child/${this.activeChildId}/schedule`);
            
            // Clear the schedule container
            const container = document.getElementById('schedule-list');
            container.innerHTML = '';
            
            // Add child selector if there are multiple children
            if (this.children.length > 1) {
                const selector = this.createChildSelector();
                document.getElementById('schedule').insertBefore(selector, container);
            }
            
            if (!schedule || Object.keys(schedule).length === 0) {
                container.innerHTML = '<p class="no-data">No schedule available</p>';
                return;
            }
            
            // Create schedule for each day
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            
            days.forEach(day => {
                const daySchedule = schedule[day];
                
                if (!daySchedule || daySchedule.length === 0) {
                    return;
                }
                
                const dayElement = document.createElement('div');
                dayElement.className = 'schedule-day';
                
                const dayTitle = document.createElement('h3');
                dayTitle.textContent = day;
                dayElement.appendChild(dayTitle);
                
                // Sort periods by time
                daySchedule.sort((a, b) => {
                    return this.timeToMinutes(a.start_time) - this.timeToMinutes(b.start_time);
                });
                
                // Add each period
                daySchedule.forEach(period => {
                    const periodElement = document.createElement('div');
                    periodElement.className = 'schedule-period';
                    
                    periodElement.innerHTML = `
                        <span class="period-time">${period.start_time}</span>
                    <div class="period-details">
                        <h4>${period.subject}</h4>
                            <p>${period.teacher_name}</p>
                            <span class="period-room">Room ${period.room}</span>
                    </div>
                    `;
                    
                    dayElement.appendChild(periodElement);
                });
                
                container.appendChild(dayElement);
            });
            
        } catch (error) {
            console.error('Error loading schedule:', error);
            this.showNotification('Error', 'Failed to load schedule', 'error');
        }
    }
    
    // Load fees tab
    async loadFees() {
        try {
            const fees = await this.apiRequest('/parent/fees');
            
            const container = document.getElementById('fees-container');
            container.innerHTML = '';
            
            if (!fees || fees.length === 0) {
                container.innerHTML = '<p class="no-data">No fees information available</p>';
                return;
            }
            
            fees.forEach(fee => {
                const card = document.createElement('div');
                card.className = 'card';
                card.id = `fee-${fee.id}`;
                
                // Determine status class
                const statusClass = fee.status.toLowerCase();
                
                card.innerHTML = `
            <div class="fee-header">
                <h3>${fee.description}</h3>
                        <span class="status ${statusClass}">${fee.status}</span>
            </div>
            <div class="fee-details">
                        <p><strong>Amount:</strong> $${fee.amount.toFixed(2)}</p>
                        <p><strong>Due Date:</strong> ${this.formatDate(fee.due_date)}</p>
                        ${fee.payment_date ? `<p><strong>Paid:</strong> ${this.formatDate(fee.payment_date)}</p>` : ''}
            </div>
            ${fee.status === 'Pending' ? `
                <div class="card-actions">
                        <button class="btn btn-primary" onclick="payFee(${fee.id})">
                        <i class="fas fa-credit-card"></i> Pay Now
                    </button>
                </div>
            ` : ''}
                `;
                
                container.appendChild(card);
            });
            
        } catch (error) {
            console.error('Error loading fees:', error);
            this.showNotification('Error', 'Failed to load fees information', 'error');
        }
    }
    
    // Load communications tab
    async loadCommunications() {
        try {
            const messages = await this.apiRequest('/parent/messages');
            
            const container = document.getElementById('communications-container');
            container.innerHTML = '';
            
            if (!messages || messages.length === 0) {
                container.innerHTML = '<p class="no-data">No messages</p>';
                return;
            }
            
            messages.forEach(message => {
                const card = document.createElement('div');
                card.className = `card ${message.read ? 'read' : 'unread'}`;
                card.id = `message-${message.id}`;
                
                card.innerHTML = `
            <div class="message-header">
                <h3>${message.subject}</h3>
                        <span class="message-date">${this.formatDate(message.date)}</span>
            </div>
                    <p><strong>From:</strong> ${message.sender}</p>
            <div class="card-actions">
                        <button class="btn btn-primary" onclick="viewMessage(${message.id})">
                    <i class="fas fa-envelope-open"></i> Read
                </button>
                        <button class="btn btn-secondary" onclick="replyToMessage(${message.id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
                    </div>
                `;
                
                container.appendChild(card);
            });
            
            // Add compose button
            const composeBtn = document.createElement('button');
            composeBtn.className = 'btn btn-primary floating-action-btn';
            composeBtn.innerHTML = '<i class="fas fa-pen"></i>';
            composeBtn.addEventListener('click', () => this.openComposeModal());
            
            container.appendChild(composeBtn);
            
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showNotification('Error', 'Failed to load messages', 'error');
        }
    }
    
    // Open compose message modal
    openComposeModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>New Message</h2>
                    <span class="close-modal" onclick="closeModal('composeModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="composeForm">
                        <div class="form-group">
                            <label for="recipient">To:</label>
                            <select id="recipient" name="recipient" class="form-control" required>
                                <option value="">Select Recipient</option>
                                ${this.generateTeacherOptions()}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="subject">Subject:</label>
                            <input type="text" id="subject" name="subject" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="message">Message:</label>
                            <textarea id="message" name="message" class="form-control" rows="6" required></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="sendMessage()">Send</button>
                    <button class="btn btn-secondary" onclick="closeModal('composeModal')">Cancel</button>
                </div>
            </div>
        `;
        
        // Create or update modal
        let modal = document.getElementById('composeModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'composeModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = modalHTML;
        modal.style.display = 'block';
    }
    
    // Generate options for teacher select
    generateTeacherOptions() {
        // Get unique teachers from children's classes
        const teachers = new Set();
        const options = [];
        
        this.children.forEach(child => {
            if (child.teachers) {
                child.teachers.forEach(teacher => {
                    if (!teachers.has(teacher.id)) {
                        teachers.add(teacher.id);
                        options.push(`<option value="${teacher.id}">${teacher.name} (${teacher.subject})</option>`);
                    }
                });
            }
        });
        
        // Add school admin option
        options.unshift('<option value="admin">School Administration</option>');
        
        return options.join('');
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Handle logout button
        document.querySelector('.btn-logout').addEventListener('click', () => this.handleLogout());
        
        // Other event listeners will be added as needed
    }
    
    // Handle logout
    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    }
    
    // Helper: Make API request
    async apiRequest(endpoint, method = 'GET', data = null) {
        const url = this.baseUrl + endpoint;
        const token = localStorage.getItem('token');
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Helper: Show notification
    showNotification(title, message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
                <button class="close-notification">&times;</button>
        </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add animation class
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Add event listener to close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Helper: Format date
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    
    // Helper: Get initials from name
    getInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('');
    }
    
    // Helper: Get priority class
    getPriorityClass(priority) {
        const priorities = {
            'high': 'high',
            'medium': 'medium',
            'low': 'low'
        };
        
        return priorities[priority.toLowerCase()] || 'medium';
    }
    
    // Helper: Get month abbreviation
    getMonthAbbr(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short' });
    }
    
    // Helper: Get day of month
    getDayOfMonth(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.getDate();
    }
    
    // Helper: Convert time string to minutes
    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
}

// Initialize parent UI
document.addEventListener('DOMContentLoaded', () => {
    const parentUI = new ParentUI();
    window.parentUI = parentUI;
    parentUI.init();
    
    // External functions needed for html event handlers
    window.openTab = (tabName) => parentUI.openTab(tabName);
    window.payFee = (feeId) => parentUI.payFee(feeId);
    window.viewMessage = (messageId) => parentUI.viewMessage(messageId);
    window.replyToMessage = (messageId) => parentUI.replyToMessage(messageId);
    window.sendMessage = () => parentUI.sendMessage();
    window.handleLogout = () => parentUI.handleLogout();
    window.goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'homepage.html';
        }
    };
    window.closeModal = (modalId) => {
        document.getElementById(modalId).style.display = 'none';
    };
}); 