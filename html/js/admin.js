// Data Management and Business Logic
const AdminSystem = {
    // Mock Data - In a real system, this would be fetched from a backend
    data: {
        students: [
            { id: 1, firstName: 'John', lastName: 'Smith', email: 'john@school.com', grade: '10', section: 'A', contact: '123-456-7890' },
            { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@school.com', grade: '11', section: 'B', contact: '123-456-7891' },
            { id: 3, firstName: 'Mike', lastName: 'Wilson', email: 'mike@school.com', grade: '9', section: 'C', contact: '123-456-7892' }
        ],
        teachers: [
            { 
                id: 1, 
                firstName: 'Jane', 
                lastName: 'Doe', 
                email: 'jane@school.com', 
                subject: 'Mathematics', 
                contact: '123-456-7893',
                qualification: 'M.Sc. Mathematics',
                bio: 'Experienced mathematics teacher with 5 years of teaching experience.',
                assignedClasses: ['Mathematics 10A', 'Mathematics 11B']
            },
            { 
                id: 2, 
                firstName: 'Robert', 
                lastName: 'Brown', 
                email: 'robert@school.com', 
                subject: 'English', 
                contact: '123-456-7894',
                qualification: 'M.A. English Literature',
                bio: 'Passionate about literature and creative writing.',
                assignedClasses: ['English 11B', 'English 10A']
            },
            { 
                id: 3, 
                firstName: 'Emily', 
                lastName: 'White', 
                email: 'emily@school.com', 
                subject: 'Science', 
                contact: '123-456-7895',
                qualification: 'Ph.D. Physics',
                bio: 'Specializes in practical science experiments and interactive learning.',
                assignedClasses: ['Science 9C', 'Physics 11A']
            }
        ],
        classes: [
            { 
                id: 1, 
                name: 'Mathematics 10A', 
                grade: '10', 
                teacher: 'Jane Doe',
                subject: 'Mathematics',
                capacity: 35,
                currentStudents: 30,
                schedule: 'Mon, Wed 9:00-10:30',
                description: 'Advanced mathematics class covering algebra and trigonometry',
                room: 'Room 101',
                status: 'active'
            },
            { 
                id: 2, 
                name: 'English 11B', 
                grade: '11', 
                teacher: 'Robert Brown',
                subject: 'English',
                capacity: 30,
                currentStudents: 25,
                schedule: 'Tue, Thu 11:00-12:30',
                description: 'Advanced English literature and composition',
                room: 'Room 203',
                status: 'active'
            },
            { 
                id: 3, 
                name: 'Science 9C', 
                grade: '9', 
                teacher: 'Emily White',
                subject: 'Science',
                capacity: 32,
                currentStudents: 28,
                schedule: 'Mon, Wed, Fri 13:00-14:00',
                description: 'Introduction to general science concepts',
                room: 'Lab 1',
                status: 'active'
            }
        ],
        activities: [
            { action: 'New student registered', timestamp: '2 hours ago' },
            { action: 'Teacher updated profile', timestamp: '3 hours ago' },
            { action: 'New class created', timestamp: '1 day ago' },
            { action: 'System maintenance completed', timestamp: '2 days ago' }
        ],
        currentUser: {
            initials: 'AD',
            name: 'Admin User',
            email: 'admin@school.com'
        }
    },

    // Data Access Methods
    getCurrentUser() {
        return this.data.currentUser;
    },

    getStudents() {
        return this.data.students;
    },

    getTeachers() {
        return this.data.teachers;
    },

    getClasses() {
        return this.data.classes;
    },

    getActivities() {
        return this.data.activities;
    },

    getDashboardStats() {
        return {
            students: this.data.students.length,
            teachers: this.data.teachers.length,
            classes: this.data.classes.length,
            parents: this.data.students.length // Assuming one parent per student
        };
    },

    // Validation Functions
    validateStudentData(data) {
        const errors = [];
        
        if (!data.firstName?.trim()) errors.push('First name is required');
        if (!data.lastName?.trim()) errors.push('Last name is required');
        if (!data.email?.trim()) errors.push('Email is required');
        if (!this.isValidEmail(data.email)) errors.push('Invalid email format');
        if (!data.grade) errors.push('Grade is required');
        if (!data.section) errors.push('Section is required');
        if (!data.contact?.trim()) errors.push('Contact number is required');
        if (!this.isValidPhoneNumber(data.contact)) errors.push('Invalid contact number format');

        return errors;
    },

    validateTeacherData(data) {
        const errors = [];
        
        if (!data.firstName?.trim()) errors.push('First name is required');
        if (!data.lastName?.trim()) errors.push('Last name is required');
        if (!data.email?.trim()) errors.push('Email is required');
        if (!this.isValidEmail(data.email)) errors.push('Invalid email format');
        if (!data.subject) errors.push('Subject is required');
        if (!data.contact?.trim()) errors.push('Contact number is required');
        if (!this.isValidPhoneNumber(data.contact)) errors.push('Invalid contact number format');
        if (!data.qualification?.trim()) errors.push('Qualification is required');

        return errors;
    },

    validateClassData(data) {
        const errors = [];
        
        if (!data.name?.trim()) errors.push('Class name is required');
        if (!data.grade) errors.push('Grade level is required');
        if (!data.teacher) errors.push('Teacher is required');
        if (!data.subject) errors.push('Subject is required');
        if (!data.capacity) errors.push('Capacity is required');
        if (isNaN(data.capacity) || data.capacity < 1 || data.capacity > 50) {
            errors.push('Capacity must be between 1 and 50');
        }
        if (!data.schedule?.trim()) errors.push('Schedule is required');

        return errors;
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhoneNumber(phone) {
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        return phoneRegex.test(phone);
    },

    // Student Management
    addStudent(studentData) {
        const errors = this.validateStudentData(studentData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        // Check for duplicate email
        if (this.data.students.some(s => s.email === studentData.email)) {
            throw new Error('A student with this email already exists');
        }

        const newId = this.data.students.length > 0 
            ? Math.max(...this.data.students.map(s => s.id)) + 1 
            : 1;
            
        const newStudent = { id: newId, ...studentData };
        this.data.students.push(newStudent);
        this.logActivity('New student registered');
        return newStudent;
    },

    updateStudent(id, studentData) {
        const errors = this.validateStudentData(studentData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        const index = this.data.students.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Student not found');
        }

        // Check for duplicate email, excluding current student
        if (this.data.students.some(s => s.email === studentData.email && s.id !== id)) {
            throw new Error('A student with this email already exists');
        }

        this.data.students[index] = { ...this.data.students[index], ...studentData };
        this.logActivity('Student information updated');
        return this.data.students[index];
    },

    deleteStudent(id) {
        const index = this.data.students.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Student not found');
        }

        this.data.students.splice(index, 1);
        this.logActivity('Student removed from system');
        return true;
    },

    // Teacher Management
    addTeacher(teacherData) {
        const errors = this.validateTeacherData(teacherData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        // Check for duplicate email
        if (this.data.teachers.some(t => t.email === teacherData.email)) {
            throw new Error('A teacher with this email already exists');
        }

        const newId = this.data.teachers.length > 0 
            ? Math.max(...this.data.teachers.map(t => t.id)) + 1 
            : 1;
            
        const newTeacher = { 
            id: newId, 
            ...teacherData,
            assignedClasses: []
        };
        
        this.data.teachers.push(newTeacher);
        this.logActivity(`New teacher ${teacherData.firstName} ${teacherData.lastName} added`);
        return newTeacher;
    },

    updateTeacher(id, teacherData) {
        const errors = this.validateTeacherData(teacherData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        const index = this.data.teachers.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Teacher not found');
        }

        // Check for duplicate email, excluding current teacher
        if (this.data.teachers.some(t => t.email === teacherData.email && t.id !== id)) {
            throw new Error('A teacher with this email already exists');
        }

        // Preserve assigned classes if not provided in update
        const assignedClasses = teacherData.assignedClasses || this.data.teachers[index].assignedClasses;
        
        this.data.teachers[index] = { 
            ...this.data.teachers[index], 
            ...teacherData,
            assignedClasses 
        };
        
        this.logActivity(`Teacher ${teacherData.firstName} ${teacherData.lastName} information updated`);
        return this.data.teachers[index];
    },

    deleteTeacher(id) {
        const teacher = this.data.teachers.find(t => t.id === id);
        if (!teacher) {
            throw new Error('Teacher not found');
        }

        // Check if teacher has assigned classes
        if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
            throw new Error('Cannot delete teacher with assigned classes');
        }

        const index = this.data.teachers.findIndex(t => t.id === id);
        this.data.teachers.splice(index, 1);
        this.logActivity(`Teacher ${teacher.firstName} ${teacher.lastName} removed from system`);
        return true;
    },

    // Additional Teacher Methods
    assignClassToTeacher(teacherId, className) {
        const teacher = this.data.teachers.find(t => t.id === teacherId);
        if (!teacher) return false;

        if (!teacher.assignedClasses.includes(className)) {
            teacher.assignedClasses.push(className);
            this.logActivity(`Class ${className} assigned to ${teacher.firstName} ${teacher.lastName}`);
            return true;
        }
        return false;
    },

    removeClassFromTeacher(teacherId, className) {
        const teacher = this.data.teachers.find(t => t.id === teacherId);
        if (!teacher) return false;

        const index = teacher.assignedClasses.indexOf(className);
        if (index !== -1) {
            teacher.assignedClasses.splice(index, 1);
            this.logActivity(`Class ${className} removed from ${teacher.firstName} ${teacher.lastName}`);
            return true;
        }
        return false;
    },

    getTeachersBySubject(subject) {
        return this.data.teachers.filter(t => t.subject === subject);
    },

    getTeacherClasses(teacherId) {
        const teacher = this.data.teachers.find(t => t.id === teacherId);
        return teacher ? teacher.assignedClasses : [];
    },

    // Class Management
    addClass(classData) {
        const errors = this.validateClassData(classData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        // Check for duplicate class name
        if (this.data.classes.some(c => c.name === classData.name)) {
            throw new Error('A class with this name already exists');
        }

        // Verify teacher exists
        const teacher = this.data.teachers.find(t => 
            `${t.firstName} ${t.lastName}` === classData.teacher
        );
        if (!teacher) {
            throw new Error('Selected teacher not found');
        }

        const newId = this.data.classes.length > 0 
            ? Math.max(...this.data.classes.map(c => c.id)) + 1 
            : 1;
            
        const newClass = { 
            id: newId,
            ...classData,
            currentStudents: 0,
            status: 'active'
        };

        this.data.classes.push(newClass);
        this.assignClassToTeacher(teacher.id, newClass.name);
        this.logActivity(`New class ${classData.name} created`);
        return newClass;
    },

    updateClass(id, classData) {
        const errors = this.validateClassData(classData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        const index = this.data.classes.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Class not found');
        }

        // Check for duplicate class name, excluding current class
        if (this.data.classes.some(c => c.name === classData.name && c.id !== id)) {
            throw new Error('A class with this name already exists');
        }

        // Verify teacher exists
        const teacher = this.data.teachers.find(t => 
            `${t.firstName} ${t.lastName}` === classData.teacher
        );
        if (!teacher) {
            throw new Error('Selected teacher not found');
        }

        // Update teacher assignments if teacher changed
        const oldTeacherName = this.data.classes[index].teacher;
        if (oldTeacherName !== classData.teacher) {
            const oldTeacher = this.data.teachers.find(t => 
                `${t.firstName} ${t.lastName}` === oldTeacherName
            );
            if (oldTeacher) {
                this.removeClassFromTeacher(oldTeacher.id, this.data.classes[index].name);
            }
            this.assignClassToTeacher(teacher.id, classData.name);
        }

        this.data.classes[index] = { ...this.data.classes[index], ...classData };
        this.logActivity(`Class ${classData.name} updated`);
        return this.data.classes[index];
    },

    deleteClass(id) {
        const classToDelete = this.data.classes.find(c => c.id === id);
        if (!classToDelete) {
            throw new Error('Class not found');
        }

        // Check if class has students
        if (classToDelete.currentStudents > 0) {
            throw new Error('Cannot delete class with enrolled students');
        }

        // Remove class from teacher's assigned classes
        const teacher = this.data.teachers.find(t => 
            `${t.firstName} ${t.lastName}` === classToDelete.teacher
        );
        if (teacher) {
            this.removeClassFromTeacher(teacher.id, classToDelete.name);
        }

        const index = this.data.classes.findIndex(c => c.id === id);
        this.data.classes.splice(index, 1);
        this.logActivity(`Class ${classToDelete.name} deleted`);
        return true;
    },

    // Additional Class Methods
    getClassesByTeacher(teacherName) {
        return this.data.classes.filter(c => c.teacher === teacherName);
    },

    getClassesByGrade(grade) {
        return this.data.classes.filter(c => c.grade === grade);
    },

    getClassesBySubject(subject) {
        return this.data.classes.filter(c => c.subject === subject);
    },

    enrollStudent(classId) {
        const classObj = this.data.classes.find(c => c.id === classId);
        if (!classObj) return false;

        if (classObj.currentStudents >= classObj.capacity) {
            return {
                success: false,
                error: 'Class has reached maximum capacity'
            };
        }

        classObj.currentStudents++;
        this.logActivity(`New student enrolled in ${classObj.name}`);
        return {
            success: true,
            data: classObj
        };
    },

    removeStudent(classId) {
        const classObj = this.data.classes.find(c => c.id === classId);
        if (!classObj) return false;

        if (classObj.currentStudents > 0) {
            classObj.currentStudents--;
            this.logActivity(`Student removed from ${classObj.name}`);
            return {
                success: true,
                data: classObj
            };
        }

        return {
            success: false,
            error: 'No students to remove from class'
        };
    },

    // Activity Logging
    logActivity(action) {
        const timestamp = new Date().toLocaleTimeString();
        this.data.activities.unshift({
            action,
            timestamp: 'Just now'
        });
        // Keep only last 10 activities
        if (this.data.activities.length > 10) {
            this.data.activities.pop();
        }
    },

    // Authentication
    logout() {
        // In a real system, this would clear session/tokens
        window.location.href = 'login.html';
    }
};

// Export the AdminSystem object for use in admin-ui.js
window.AdminSystem = AdminSystem; 