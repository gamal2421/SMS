<<<<<<< HEAD
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
=======
// Assignment Management System
const AssignmentSystem = {
    data: {
        assignments: [
            {
                id: 1,
                title: 'Mathematics Assignment 1',
                description: 'Solve the given problems from Chapter 3: Trigonometry and Complex Numbers. Show all your work and explain your reasoning.',
                classId: 1,
                teacherId: 1,
                dueDate: '2024-03-25',
                maxPoints: 100,
                attachments: ['chapter3_problems.pdf', 'formula_sheet.pdf'],
                submissions: [
                    {
                        id: 1,
                        studentId: 1,
                        submissionDate: '2024-03-20',
                        files: ['john_smith_solutions.pdf', 'workings.jpg'],
                        grade: 95,
                        feedback: 'Excellent work! Very clear explanations and well-organized solutions.',
                        status: 'graded'
                    },
                    {
                        id: 2,
                        studentId: 2,
                        submissionDate: '2024-03-21',
                        files: ['sarah_solutions.pdf'],
                        grade: 88,
                        feedback: 'Good work, but please show more steps in complex number calculations.',
                        status: 'graded'
                    },
                    {
                        id: 3,
                        studentId: 3,
                        submissionDate: '2024-03-22',
                        files: ['mike_assignment1.pdf', 'calculations.xlsx'],
                        status: 'submitted'
                    }
                ],
                status: 'active'
            },
            {
                id: 2,
                title: 'English Literature Essay',
                description: 'Write a 2000-word analytical essay on the themes of power and corruption in Shakespeare\'s Macbeth.',
                classId: 2,
                teacherId: 2,
                dueDate: '2024-03-28',
                maxPoints: 100,
                attachments: ['essay_guidelines.pdf', 'macbeth_study_guide.pdf'],
                submissions: [
                    {
                        id: 4,
                        studentId: 2,
                        submissionDate: '2024-03-23',
                        files: ['sarah_macbeth_essay.docx', 'references.pdf'],
                        grade: 92,
                        feedback: 'Outstanding analysis of Lady Macbeth\'s character development. Excellent use of textual evidence.',
                        status: 'graded'
                    },
                    {
                        id: 5,
                        studentId: 1,
                        submissionDate: '2024-03-24',
                        files: ['john_essay_draft.docx'],
                        status: 'submitted'
                    }
                ],
                status: 'active'
            },
            {
                id: 3,
                title: 'Physics Lab Report',
                description: 'Write a detailed lab report on the pendulum experiment conducted in class. Include your data analysis and error calculations.',
                classId: 3,
                teacherId: 3,
                dueDate: '2024-03-30',
                maxPoints: 100,
                attachments: ['lab_report_template.docx', 'data_analysis_guide.pdf'],
                submissions: [
                    {
                        id: 6,
                        studentId: 3,
                        submissionDate: '2024-03-25',
                        files: [
                            'mike_lab_report.pdf',
                            'experiment_data.xlsx',
                            'graphs.png',
                            'calculations.pdf'
                        ],
                        grade: 98,
                        feedback: 'Exceptional work! Your error analysis was particularly thorough. Excellent graphs and data presentation.',
                        status: 'graded'
                    }
                ],
                status: 'active'
            },
            {
                id: 4,
                title: 'Computer Science Project',
                description: 'Develop a simple web application using HTML, CSS, and JavaScript. The application should demonstrate CRUD operations.',
                classId: 1,
                teacherId: 1,
                dueDate: '2024-04-05',
                maxPoints: 100,
                attachments: ['project_requirements.pdf', 'sample_code.zip'],
                submissions: [
                    {
                        id: 7,
                        studentId: 1,
                        submissionDate: '2024-03-25',
                        files: [
                            'john_project.zip',
                            'documentation.pdf',
                            'demo_video.mp4',
                            'screenshots.pdf'
                        ],
                        status: 'submitted'
                    },
                    {
                        id: 8,
                        studentId: 2,
                        submissionDate: '2024-03-26',
                        files: [
                            'sarah_webapp.zip',
                            'readme.md',
                            'presentation.pptx'
                        ],
                        grade: 95,
                        feedback: 'Excellent project! Clean code and great user interface. Well documented.',
                        status: 'graded'
                    }
                ],
                status: 'active'
            },
            {
                id: 5,
                title: 'Chemistry Lab Analysis',
                description: 'Complete the analysis of the titration experiment. Include all calculations, graphs, and error analysis.',
                classId: 3,
                teacherId: 3,
                dueDate: '2024-04-02',
                maxPoints: 100,
                attachments: ['titration_guide.pdf', 'data_sheet.xlsx'],
                submissions: [
                    {
                        id: 9,
                        studentId: 3,
                        submissionDate: '2024-03-27',
                        files: [
                            'mike_titration_report.pdf',
                            'calculations.xlsx',
                            'error_analysis.pdf',
                            'concentration_graphs.png'
                        ],
                        status: 'submitted'
                    }
                ],
                status: 'active'
            }
        ]
    },

    // Assignment Management
    createAssignment(assignmentData) {
        const errors = this.validateAssignmentData(assignmentData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        const newId = this.data.assignments.length > 0 
            ? Math.max(...this.data.assignments.map(a => a.id)) + 1 
            : 1;

        const newAssignment = {
            id: newId,
            ...assignmentData,
            submissions: [],
            status: 'active',
            createdAt: new Date().toISOString()
        };

        this.data.assignments.push(newAssignment);
        return newAssignment;
    },

    updateAssignment(id, assignmentData) {
        const errors = this.validateAssignmentData(assignmentData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        const index = this.data.assignments.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('Assignment not found');
        }

        this.data.assignments[index] = {
            ...this.data.assignments[index],
            ...assignmentData,
            updatedAt: new Date().toISOString()
        };

        return this.data.assignments[index];
    },

    deleteAssignment(id) {
        const index = this.data.assignments.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('Assignment not found');
        }

        this.data.assignments.splice(index, 1);
        return true;
    },

    // Submission Management
    submitAssignment(assignmentId, submissionData) {
        const assignment = this.data.assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            throw new Error('Assignment not found');
        }

        const newSubmission = {
            id: assignment.submissions.length + 1,
            ...submissionData,
            submissionDate: new Date().toISOString(),
            status: 'submitted'
        };

        assignment.submissions.push(newSubmission);
        return newSubmission;
    },

    gradeSubmission(assignmentId, submissionId, gradeData) {
        const assignment = this.data.assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            throw new Error('Assignment not found');
        }

        const submission = assignment.submissions.find(s => s.id === submissionId);
        if (!submission) {
            throw new Error('Submission not found');
        }

        Object.assign(submission, {
            ...gradeData,
            status: 'graded',
            gradedAt: new Date().toISOString()
        });

        return submission;
    },

    // Validation
    validateAssignmentData(data) {
        const errors = [];
        
        if (!data.title?.trim()) errors.push('Title is required');
        if (!data.description?.trim()) errors.push('Description is required');
        if (!data.classId) errors.push('Class is required');
        if (!data.teacherId) errors.push('Teacher is required');
        if (!data.dueDate) errors.push('Due date is required');
        if (!data.maxPoints || data.maxPoints < 0) errors.push('Valid max points are required');

        return errors;
    },

    // Queries
    getAssignmentsByTeacher(teacherId) {
        return this.data.assignments.filter(a => a.teacherId === teacherId);
    },

    getAssignmentsByClass(classId) {
        return this.data.assignments.filter(a => a.classId === classId);
    },

    getSubmissionsByStudent(studentId) {
        return this.data.assignments.reduce((submissions, assignment) => {
            const studentSubmissions = assignment.submissions
                .filter(s => s.studentId === studentId)
                .map(s => ({ ...s, assignmentTitle: assignment.title }));
            return [...submissions, ...studentSubmissions];
        }, []);
    }
};

// Export the AssignmentSystem object
window.AssignmentSystem = AssignmentSystem; 
>>>>>>> bd2aa6b26b1b74a5ce711fbbdce6b42612ef8105
