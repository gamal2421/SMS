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