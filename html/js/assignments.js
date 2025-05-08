class AssignmentsUI {
    constructor() {
        this.api = new TeacherAPI();
        this.currentAssignment = null;
        this.assignments = [];
        this.classes = [];
        this.init();
    }

    async init() {
        try {
            // Load user info
            const user = await this.api.getCurrentUser();
            document.getElementById('userName').textContent = user.full_name;
            document.getElementById('userInitials').textContent = user.full_name
                .split(' ')
                .map(n => n[0])
                .join('');

            // Load classes for filters and forms
            this.classes = await this.api.getClasses();
            this.populateClassDropdowns();

            // Load and display assignments
            await this.loadAssignments();

            // Set up event listeners
            document.getElementById('searchInput').addEventListener('input', () => this.filterAssignments());
            document.getElementById('classFilter').addEventListener('change', () => this.filterAssignments());
            document.getElementById('statusFilter').addEventListener('change', () => this.filterAssignments());
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize the page. Please refresh and try again.');
        }
    }

    async loadAssignments() {
        try {
            const assignmentsGrid = document.getElementById('assignmentsGrid');
            assignmentsGrid.innerHTML = '<div class="loading-spinner"></div>';

            this.assignments = await this.api.getAssignments();
            this.displayAssignments(this.assignments);
        } catch (error) {
            console.error('Error loading assignments:', error);
            this.showError('Failed to load assignments. Please try again.');
        }
    }

    displayAssignments(assignments) {
        const grid = document.getElementById('assignmentsGrid');
        grid.innerHTML = '';

        if (assignments.length === 0) {
            grid.innerHTML = '<div class="no-assignments">No assignments found</div>';
            return;
        }

        assignments.forEach(assignment => {
            const card = document.createElement('div');
            card.className = 'assignment-card';
            card.innerHTML = `
                <div class="assignment-header">
                    <h3 class="assignment-title">${assignment.title}</h3>
                    <span class="assignment-status status-${assignment.status.toLowerCase()}">${assignment.status}</span>
                </div>
                <div class="assignment-info">
                    <div>
                        <i class="fas fa-chalkboard"></i>
                        <span>${assignment.class_name}</span>
                    </div>
                    <div>
                        <i class="fas fa-calendar"></i>
                        <span>Due: ${this.formatDate(assignment.due_date)}</span>
                    </div>
                    <div>
                        <i class="fas fa-users"></i>
                        <span>${assignment.submission_stats.total_submissions} / ${assignment.total_students} Submissions</span>
                    </div>
                </div>
                <p class="assignment-description">${assignment.description}</p>
                <div class="assignment-actions">
                    <button class="btn-action btn-view" onclick="assignmentsUI.viewAssignment(${assignment.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="assignmentsUI.showEditModal(${assignment.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="assignmentsUI.deleteAssignment(${assignment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    populateClassDropdowns() {
        const dropdowns = ['classFilter', 'class', 'editClass'];
        dropdowns.forEach(id => {
            const dropdown = document.getElementById(id);
            if (!dropdown) return;

            // Clear existing options except the first one
            while (dropdown.options.length > 1) {
                dropdown.remove(1);
            }

            // Add class options
            this.classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                dropdown.appendChild(option);
            });
        });
    }

    filterAssignments() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const classId = document.getElementById('classFilter').value;
        const status = document.getElementById('statusFilter').value;

        const filtered = this.assignments.filter(assignment => {
            const matchesSearch = assignment.title.toLowerCase().includes(searchTerm) ||
                                assignment.description.toLowerCase().includes(searchTerm);
            const matchesClass = !classId || assignment.class_id.toString() === classId;
            const matchesStatus = !status || assignment.status.toLowerCase() === status.toLowerCase();

            return matchesSearch && matchesClass && matchesStatus;
        });

        this.displayAssignments(filtered);
    }

    showCreateModal() {
        const modal = document.getElementById('createAssignmentModal');
        modal.style.display = 'block';

        // Set minimum date to today
        const dateInput = document.getElementById('dueDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    async createAssignment(event) {
        event.preventDefault();
        try {
            const formData = {
                title: document.getElementById('title').value,
                class_id: parseInt(document.getElementById('class').value),
                description: document.getElementById('description').value,
                due_date: document.getElementById('dueDate').value,
                max_score: parseFloat(document.getElementById('maxScore').value),
                status: 'active'
            };

            await this.api.createAssignment(formData);
            this.closeModal('createAssignmentModal');
            await this.loadAssignments();
            this.showSuccess('Assignment created successfully');

            // Reset form
            document.getElementById('createAssignmentForm').reset();
        } catch (error) {
            console.error('Error creating assignment:', error);
            this.showError('Failed to create assignment. Please try again.');
        }
    }

    async viewAssignment(id) {
        try {
            const assignment = await this.api.getAssignment(id);
            this.currentAssignment = assignment;

            // Update modal content
            document.getElementById('viewTitle').textContent = assignment.title;
            document.getElementById('viewClass').textContent = assignment.class_name;
            document.getElementById('viewDueDate').textContent = this.formatDate(assignment.due_date);
            document.getElementById('viewStatus').textContent = assignment.status;
            document.getElementById('viewMaxScore').textContent = assignment.max_score;
            document.getElementById('viewDescription').textContent = assignment.description;

            // Update submission stats
            document.getElementById('totalSubmissions').textContent = assignment.submission_stats.total_submissions;
            document.getElementById('gradedSubmissions').textContent = assignment.submission_stats.graded_submissions;
            document.getElementById('pendingSubmissions').textContent = assignment.submission_stats.pending_submissions;

            // Display submissions
            this.displaySubmissions(assignment.submissions);

            // Show modal
            document.getElementById('viewAssignmentModal').style.display = 'block';
        } catch (error) {
            console.error('Error viewing assignment:', error);
            this.showError('Failed to load assignment details. Please try again.');
        }
    }

    displaySubmissions(submissions) {
        const list = document.getElementById('submissionsList');
        list.innerHTML = '';

        if (!submissions || submissions.length === 0) {
            list.innerHTML = '<div class="no-submissions">No submissions yet</div>';
            return;
        }

        submissions.forEach(submission => {
            const item = document.createElement('div');
            item.className = 'submission-item';
            item.innerHTML = `
                <div class="submission-info">
                    <div class="student-name">${submission.student_name}</div>
                    <div class="submission-date">Submitted: ${this.formatDate(submission.submission_date)}</div>
                </div>
                <span class="submission-status status-${submission.score ? 'graded' : 'submitted'}">
                    ${submission.score ? `Graded: ${submission.score}` : 'Pending'}
                </span>
                <button class="btn-action btn-view" onclick="assignmentsUI.viewSubmission(${submission.id})">
                    <i class="fas fa-eye"></i>
                </button>
            `;
            list.appendChild(item);
        });
    }

    async viewSubmission(submissionId) {
        try {
            const submission = this.currentAssignment.submissions.find(s => s.id === submissionId);
            if (!submission) throw new Error('Submission not found');

            // Update modal content
            document.getElementById('submissionStudent').textContent = submission.student_name;
            document.getElementById('submissionDate').textContent = this.formatDate(submission.submission_date);
            document.getElementById('submissionScore').value = submission.score || '';
            document.getElementById('submissionFeedback').value = submission.feedback || '';

            // Update file download link
            const fileLink = document.getElementById('submissionFile');
            fileLink.href = `/teacher/assignments/submissions/${submission.file_path}`;
            fileLink.download = submission.file_path.split('/').pop();

            // Show modal
            document.getElementById('viewSubmissionModal').style.display = 'block';
        } catch (error) {
            console.error('Error viewing submission:', error);
            this.showError('Failed to load submission details. Please try again.');
        }
    }

    async saveSubmissionGrade() {
        try {
            const submissionId = this.currentSubmission.id;
            const score = parseFloat(document.getElementById('submissionScore').value);
            const feedback = document.getElementById('submissionFeedback').value;

            await this.api.gradeSubmission(submissionId, { score, feedback });
            this.closeModal('viewSubmissionModal');
            await this.viewAssignment(this.currentAssignment.id); // Refresh assignment view
            this.showSuccess('Grade saved successfully');
        } catch (error) {
            console.error('Error saving grade:', error);
            this.showError('Failed to save grade. Please try again.');
        }
    }

    async showEditModal(id) {
        try {
            const assignment = await this.api.getAssignment(id);
            this.currentAssignment = assignment;

            // Populate form fields
            document.getElementById('editId').value = assignment.id;
            document.getElementById('editTitle').value = assignment.title;
            document.getElementById('editClass').value = assignment.class_id;
            document.getElementById('editDescription').value = assignment.description;
            document.getElementById('editDueDate').value = assignment.due_date;
            document.getElementById('editMaxScore').value = assignment.max_score;
            document.getElementById('editStatus').value = assignment.status.toLowerCase();

            // Show modal
            document.getElementById('editAssignmentModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading assignment for editing:', error);
            this.showError('Failed to load assignment details. Please try again.');
        }
    }

    async updateAssignment(event) {
        event.preventDefault();
        try {
            const formData = {
                title: document.getElementById('editTitle').value,
                class_id: parseInt(document.getElementById('editClass').value),
                description: document.getElementById('editDescription').value,
                due_date: document.getElementById('editDueDate').value,
                max_score: parseFloat(document.getElementById('editMaxScore').value),
                status: document.getElementById('editStatus').value
            };

            await this.api.updateAssignment(this.currentAssignment.id, formData);
            this.closeModal('editAssignmentModal');
            await this.loadAssignments();
            this.showSuccess('Assignment updated successfully');
        } catch (error) {
            console.error('Error updating assignment:', error);
            this.showError('Failed to update assignment. Please try again.');
        }
    }

    async deleteAssignment(id) {
        if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            return;
        }

        try {
            await this.api.deleteAssignment(id);
            await this.loadAssignments();
            this.showSuccess('Assignment deleted successfully');
        } catch (error) {
            console.error('Error deleting assignment:', error);
            this.showError('Failed to delete assignment. Please try again.');
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    showSuccess(message) {
        // Implement your preferred success notification method
        alert(message);
    }

    showError(message) {
        // Implement your preferred error notification method
        alert(message);
    }

    logout() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// Initialize the UI
const assignmentsUI = new AssignmentsUI(); 