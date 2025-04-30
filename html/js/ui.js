// UI Functions for Parent Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user info
    initializeUserInfo();
    
    // Show default tab
    openTab('dashboard');
    
    // Initialize notifications
    initializeNotifications();
    
    // Initialize progress bars
    initializeProgressBars();
});

// User Information
function initializeUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (userAvatar) {
        userAvatar.textContent = 'DW'; // Get initials from user name
    }
    if (userName) {
        userName.textContent = 'David Wilson';
    }
}

// Tab Navigation
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.style.display = 'none');
    
    // Remove active class from all tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show the selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        // Add active class to the clicked button
        const activeButton = document.querySelector(`[onclick="openTab('${tabName}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
}

// Progress Bars
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const fill = bar.querySelector('.progress-fill');
        if (fill) {
            const width = fill.getAttribute('data-progress') || '0';
            fill.style.width = width + '%';
        }
    });
}

// Notifications
function initializeNotifications() {
    // Add notification badges to tabs if needed
    const communicationsTab = document.querySelector('[onclick="openTab(\'communications\')"]');
    if (communicationsTab) {
        updateMessageBadge();
    }
}

// Show Toast Message
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    
    const icon = document.createElement('i');
    switch(type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        case 'error':
            icon.className = 'fas fa-times-circle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(' ' + message));
    
    const toastContainer = document.getElementById('toast-container') || document.body;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Fee Payment Functions
function payFee(feeId) {
    try {
        const feeElement = document.getElementById(feeId);
        if (!feeElement) {
            console.error(`Fee element with ID '${feeId}' not found`);
            return;
        }

        const amountElement = feeElement.querySelector('.fee-details strong');
        const amount = amountElement ? amountElement.textContent : '0';
        
        showToast('Processing payment...', 'info');
        
        // Simulate payment process
        setTimeout(() => {
            showToast('Payment successful!', 'success');
            
            // Update payment status
            const status = feeElement.querySelector('.status');
            if (status) {
                status.className = 'status paid';
                status.textContent = 'Paid';
            }
            
            // Disable pay button
            const payButton = feeElement.querySelector('.btn-primary');
            if (payButton) {
                payButton.disabled = true;
                payButton.innerHTML = '<i class="fas fa-check"></i> Paid';
            }
        }, 2000);
    } catch (error) {
        console.error('Error processing payment:', error);
        showToast('Error processing payment', 'error');
    }
}

// Message data (simulated database)
const messageData = {
    'message-math': {
        title: 'Mathematics Performance',
        from: 'Dr. Jane Doe',
        date: 'March 15, 2024',
        content: `Dear Mr. Wilson,

I wanted to discuss Mike's recent performance in Mathematics class. While his overall grade remains good at 88%, I've noticed some areas where he could improve.

Strengths:
- Excellent problem-solving skills
- Active participation in class
- Consistent homework completion

Areas for Improvement:
- More attention to detail in complex calculations
- Better time management during tests

I would recommend some additional practice with our online resources. Would you be available for a brief meeting next week to discuss this in more detail?

Best regards,
Dr. Jane Doe
Mathematics Department`
    },
    'message-progress': {
        title: 'Academic Progress',
        from: 'Principal Smith',
        date: 'March 10, 2024',
        content: `Dear Mr. Wilson,

I'm writing to commend Mike's overall academic progress this semester. His teachers have reported consistent improvement across multiple subjects.

Particularly noteworthy is his involvement in the Science Club and his recent presentation at the Mathematics Competition.

Keep up the great work!

Best regards,
Principal Smith`
    },
    'message-attendance': {
        title: 'Attendance Update',
        from: 'Mrs. Sarah Parker',
        date: 'March 18, 2024',
        content: `Dear Mr. Wilson,

I wanted to bring to your attention that Mike has maintained an excellent attendance record this semester, with a 95% attendance rate. This level of consistency greatly contributes to his academic performance.

However, I noticed he was late to class twice last week. While this is not a major concern, I wanted to ensure you were aware of it.

Please let me know if there are any circumstances we should be aware of.

Best regards,
Mrs. Sarah Parker
Attendance Coordinator`
    },
    'message-science-club': {
        title: 'Science Club Competition',
        from: 'Dr. Robert Chen',
        date: 'March 16, 2024',
        content: `Dear Mr. Wilson,

I'm pleased to inform you that Mike has been selected to represent our school in the upcoming Regional Science Competition. His project on renewable energy has impressed the selection committee.

The competition will be held on April 10th at the City Convention Center. We will need your permission for Mike's participation.

Key Details:
- Date: April 10th, 2024
- Time: 9:00 AM - 4:00 PM
- Venue: City Convention Center
- Project Category: Environmental Science
- Team: Mike Wilson & James Thompson

Please fill out the attached permission form by March 25th.

Best regards,
Dr. Robert Chen
Science Department Head`
    },
    'message-career-day': {
        title: 'Career Day Invitation',
        from: 'Ms. Emily Brooks',
        date: 'March 15, 2024',
        content: `Dear Mr. Wilson,

Our annual Career Day is approaching, and we would be honored if you could participate as one of our guest speakers. Given your experience in the technology sector, your insights would be invaluable to our students.

Event Details:
- Date: April 15th, 2024
- Time: 10:00 AM - 12:00 PM
- Location: School Auditorium
- Session Duration: 30 minutes

Please let me know if you would be available to participate. We can be flexible with the timing within the event schedule.

Best regards,
Ms. Emily Brooks
Career Counselor`
    }
};

// Message Functions
function viewMessage(messageId) {
    try {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) {
            console.error(`Message element with ID '${messageId}' not found`);
            showToast('Message not found', 'error');
            return;
        }
        
        // Get message data
        const message = messageData[messageId];
        if (!message) {
            showToast('Message content not found', 'error');
            return;
        }

        // Update modal content
        document.getElementById('modal-title').textContent = message.title;
        document.getElementById('modal-from').textContent = message.from;
        document.getElementById('modal-date').textContent = message.date;
        document.getElementById('modal-content').textContent = message.content;
        
        // Show modal
        const modal = document.getElementById('message-modal');
        if (!modal) {
            console.error('Message modal not found');
            showToast('Error displaying message', 'error');
            return;
        }
        modal.classList.add('show');
        
        // Remove unread status
        messageElement.classList.remove('unread');
        messageElement.classList.add('read');
        
        // Update badge count
        updateMessageBadge();
        
    } catch (error) {
        console.error('Error viewing message:', error);
        showToast('Error opening message', 'error');
    }
}

function closeModal() {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function replyToMessage(messageId) {
    try {
        // If messageId is provided, get the message data directly
        if (messageId) {
            const message = messageData[messageId];
            if (!message) {
                showToast('Message not found', 'error');
                return;
            }
            
            // Update reply modal
            document.getElementById('reply-to').textContent = message.from;
            document.getElementById('reply-subject').textContent = message.title;
        } else {
            // Get current message info from open modal
            const title = document.getElementById('modal-title').textContent;
            const to = document.getElementById('modal-from').textContent;
            
            // Update reply modal
            document.getElementById('reply-to').textContent = to;
            document.getElementById('reply-subject').textContent = title;
            
            // Close message modal
            closeModal();
        }
        
        // Show reply modal
        const replyModal = document.getElementById('reply-modal');
        if (!replyModal) {
            showToast('Reply form not found', 'error');
            return;
        }
        replyModal.classList.add('show');
        
        // Focus on textarea
        document.getElementById('reply-message').focus();
        
    } catch (error) {
        console.error('Error opening reply form:', error);
        showToast('Error opening reply form', 'error');
    }
}

function closeReplyModal() {
    const modal = document.getElementById('reply-modal');
    modal.classList.remove('show');
    // Clear textarea
    document.getElementById('reply-message').value = '';
}

function sendReply() {
    try {
        const to = document.getElementById('reply-to').textContent;
        const subject = document.getElementById('reply-subject').textContent;
        const message = document.getElementById('reply-message').value.trim();
        
        if (!message) {
            showToast('Please enter a message', 'warning');
            return;
        }
        
        // Here you would typically send the message to the server
        showToast('Sending reply...', 'info');
        
        setTimeout(() => {
            closeReplyModal();
            showToast('Reply sent successfully', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Error sending reply:', error);
        showToast('Error sending reply', 'error');
    }
}

// Update message badge count
function updateMessageBadge() {
    try {
        const unreadCount = document.querySelectorAll('.card.unread').length;
        const communicationsTab = document.querySelector('[onclick="openTab(\'communications\')"]');
        let badge = communicationsTab.querySelector('.badge');
        
        if (!badge && unreadCount > 0) {
            badge = document.createElement('span');
            badge.className = 'badge';
            communicationsTab.appendChild(badge);
        }
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating message badge:', error);
    }
}

// Update Grades Chart
function updateGradesChart() {
    try {
        const charts = document.querySelectorAll('.grades-chart');
        charts.forEach(chart => {
            const bars = chart.querySelectorAll('.grade-bar');
            bars.forEach(bar => {
                const height = bar.getAttribute('data-height') || '0';
                bar.style.height = height + '%';
            });
        });
    } catch (error) {
        console.error('Error updating grades chart:', error);
    }
} 