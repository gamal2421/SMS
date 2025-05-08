from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from school_api.app.models import Base, User, Class, ClassEnrollment, Assignment, AssignmentSubmission, Grade, Attendance
from school_api.app.auth import get_password_hash
from datetime import datetime, timedelta
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///school.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_database():
    """Seed the database with initial data"""
    try:
        # Create tables
        Base.metadata.drop_all(bind=engine)  # Drop existing tables
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        
        logger.info("Starting database seeding...")
        
        # Create teachers with more diverse subjects and qualifications
        subjects = [
            ("Computer Science", "Ph.D. Computer Science"),
            ("Mathematics", "Ph.D. Mathematics"),
            ("Physics", "Ph.D. Physics"),
            ("Chemistry", "Ph.D. Chemistry"),
            ("Biology", "Ph.D. Biology"),
            ("English", "M.A. English Literature"),
            ("History", "Ph.D. History"),
            ("Geography", "Ph.D. Environmental Science"),
            ("Physical Education", "M.Sc. Sports Science"),
            ("Art", "M.F.A. Fine Arts"),
            ("Music", "D.M.A. Music Performance"),
            ("Economics", "Ph.D. Economics"),
            ("Psychology", "Ph.D. Psychology"),
            ("French", "M.A. French Literature"),
            ("Computer Engineering", "Ph.D. Computer Engineering")
        ]
        
        first_names = ["Sarah", "John", "Emily", "Michael", "Jessica", "David", "Lisa", "Robert", "Jennifer", "William",
                      "Maria", "James", "Linda", "Carlos", "Priya"]
        last_names = ["Johnson", "Smith", "Wilson", "Brown", "Davis", "Miller", "Anderson", "Taylor", "Thomas", "Moore",
                     "Garcia", "Rodriguez", "Patel", "Chen", "Kim"]
        
        teachers = []
        for i, (subject, qualification) in enumerate(subjects):
            teacher = User(
                email=f"{last_names[i].lower()}.{first_names[i].lower()}@school.com",
                full_name=f"{first_names[i]} {last_names[i]}",
                hashed_password=get_password_hash("teacher123"),
                role="teacher",
                is_active=True,
                subject=subject,
                contact=f"+1-555-{random.randint(100,999)}-{random.randint(1000,9999)}",
                qualification=qualification,
                created_at=datetime.utcnow()
            )
            teachers.append(teacher)
            db.add(teacher)
        
        db.commit()
        logger.info(f"{len(teachers)} teachers created successfully")
        
        # Create students (40 students) with more diverse data
        student_first_names = [
            "Emma", "James", "Sophia", "Oliver", "Ava", "William", "Isabella", "Lucas", "Mia", "Ethan",
            "Charlotte", "Mason", "Amelia", "Henry", "Harper", "Alexander", "Evelyn", "Sebastian", "Abigail", "Jack",
            "Emily", "Daniel", "Elizabeth", "Michael", "Sofia", "Benjamin", "Avery", "Logan", "Ella", "Owen",
            "Zoe", "Nathan", "Maya", "Adrian", "Luna", "Leo", "Victoria", "Diego", "Chloe", "Xavier"
        ]
        
        student_last_names = [
            "Brown", "Wilson", "Lee", "Chen", "Martinez", "Anderson", "Taylor", "Thomas", "Garcia", "Moore",
            "Jackson", "White", "Harris", "Martin", "Thompson", "Young", "Clark", "Walker", "Hall", "Allen",
            "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Nelson", "Carter",
            "Patel", "Kim", "Singh", "Rodriguez", "Chang", "Gupta", "Santos", "Kumar", "Ali", "Zhang"
        ]
        
        grades = ["9", "10", "11", "12"]
        sections = ["A", "B", "C", "D"]
        
        students = []
        for i in range(40):
            grade = random.choice(grades)
            section = random.choice(sections)
            emergency_contacts = [
                f"Parent: +1-555-{random.randint(100,999)}-{random.randint(1000,9999)}",
                f"Guardian: +1-555-{random.randint(100,999)}-{random.randint(1000,9999)}"
            ]
            student = User(
                email=f"{student_first_names[i].lower()}.{student_last_names[i].lower()}@student.com",
                full_name=f"{student_first_names[i]} {student_last_names[i]}",
                hashed_password=get_password_hash("student123"),
                role="student",
                is_active=True,
                grade=grade,
                section=section,
                contact="; ".join(emergency_contacts),
                created_at=datetime.utcnow()
            )
            students.append(student)
            db.add(student)
        
        db.commit()
        logger.info(f"{len(students)} students created successfully")
        
        # Create classes (25 classes) with more detailed information
        class_subjects = [
            ("Advanced Programming", "Computer Science"),
            ("Data Structures & Algorithms", "Computer Science"),
            ("Calculus I", "Mathematics"),
            ("Statistics", "Mathematics"),
            ("Physics Mechanics", "Physics"),
            ("Quantum Physics", "Physics"),
            ("Organic Chemistry", "Chemistry"),
            ("Biochemistry", "Chemistry"),
            ("Molecular Biology", "Biology"),
            ("Genetics", "Biology"),
            ("World Literature", "English"),
            ("Creative Writing", "English"),
            ("Modern World History", "History"),
            ("Ancient Civilizations", "History"),
            ("Environmental Science", "Geography"),
            ("Climate Studies", "Geography"),
            ("Team Sports", "Physical Education"),
            ("Fitness Training", "Physical Education"),
            ("Digital Art", "Art"),
            ("Traditional Art", "Art"),
            ("Orchestra", "Music"),
            ("Music Theory", "Music"),
            ("Microeconomics", "Economics"),
            ("Educational Psychology", "Psychology"),
            ("French Language", "French")
        ]
        
        time_slots = [
            "08:00-09:30", "09:45-11:15", "11:30-13:00",
            "13:45-15:15", "15:30-17:00"
        ]
        
        day_combinations = [
            "Mon, Wed, Fri", "Tue, Thu",
            "Mon, Thu", "Wed, Fri",
            "Tue, Fri"
        ]
        
        classes = []
        for i, (name, subject) in enumerate(class_subjects):
            teacher = next((t for t in teachers if t.subject == subject), random.choice(teachers))
            grade = random.choice(grades)
            section = random.choice(sections)
            schedule_days = random.choice(day_combinations)
            schedule_time = random.choice(time_slots)
            
            class_ = Class(
                name=name,
                grade=grade,
                section=section,
                subject=subject,
                teacher_id=teacher.id,
                capacity=25,
                current_students=0,
                schedule=f"{schedule_days} {schedule_time}",
                room=f"Room {random.randint(101, 420)}",
                status="active",
                created_at=datetime.utcnow()
            )
            classes.append(class_)
            db.add(class_)
        
        db.commit()
        logger.info(f"{len(classes)} classes created successfully")
        
        # Create enrollments (3-5 classes per student)
        enrollments = []
        for student in students:
            num_classes = random.randint(3, 5)
            available_classes = [c for c in classes if c.grade == student.grade]
            if len(available_classes) < num_classes:
                available_classes = classes  # Fallback if not enough classes in grade
            
            student_classes = random.sample(available_classes, min(num_classes, len(available_classes)))
            for class_ in student_classes:
                enrollment = ClassEnrollment(
                    student_id=student.id,
                    class_id=class_.id,
                    status="active",
                    enrollment_date=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
                    created_at=datetime.utcnow()
                )
                enrollments.append(enrollment)
                db.add(enrollment)
                class_.current_students += 1
        
        db.commit()
        logger.info(f"{len(enrollments)} enrollments created successfully")
        
        # Create assignments with various types and descriptions
        assignment_types = [
            "Quiz", "Homework", "Project", "Essay", "Lab Report",
            "Presentation", "Research Paper", "Group Work"
        ]
        
        assignments = []
        for class_ in classes:
            num_assignments = random.randint(3, 6)  # 3-6 assignments per class
            for i in range(num_assignments):
                assignment_type = random.choice(assignment_types)
                due_date = datetime.utcnow() + timedelta(days=random.randint(1, 45))
                
                description = f"{assignment_type} for {class_.name}. "
                if assignment_type == "Quiz":
                    description += "Complete the online quiz covering recent topics."
                elif assignment_type == "Homework":
                    description += "Solve the assigned problems and show all work."
                elif assignment_type == "Project":
                    description += "Develop a comprehensive project demonstrating course concepts."
                elif assignment_type == "Essay":
                    description += "Write a well-researched essay on the assigned topic."
                elif assignment_type == "Lab Report":
                    description += "Document your laboratory experiment and findings."
                elif assignment_type == "Presentation":
                    description += "Prepare and deliver a presentation on the chosen topic."
                elif assignment_type == "Research Paper":
                    description += "Research and write a paper on an approved topic."
                else:  # Group Work
                    description += "Collaborate with your team to complete the assigned task."
                
                max_score = 100 if assignment_type in ["Project", "Research Paper"] else \
                           50 if assignment_type in ["Quiz", "Homework"] else 75
                
                assignment = Assignment(
                    title=f"{class_.name} - {assignment_type} {i+1}",
                    description=description,
                    class_id=class_.id,
                    teacher_id=class_.teacher_id,
                    due_date=due_date,
                    max_score=max_score,
                    status="active",
                    created_at=datetime.utcnow()
                )
                assignments.append(assignment)
                db.add(assignment)
        
        db.commit()
        logger.info(f"{len(assignments)} assignments created successfully")
        
        # Create submissions and grades with detailed feedback
        submissions = []
        grades = []
        feedback_templates = {
            "Excellent": [
                "Outstanding work! Shows deep understanding of the material.",
                "Exceptional effort with creative and thorough approach.",
                "Excellent analysis and well-structured presentation.",
                "Superior work demonstrating mastery of concepts."
            ],
            "Good": [
                "Good work overall. Shows solid understanding.",
                "Well-done with minor areas for improvement.",
                "Strong effort with good attention to detail.",
                "Clear understanding of core concepts demonstrated."
            ],
            "Average": [
                "Satisfactory work with room for improvement.",
                "Demonstrates basic understanding but needs more depth.",
                "Meets basic requirements but could use more detail.",
                "Acceptable work but could be more thorough."
            ],
            "NeedsImprovement": [
                "Please review core concepts and resubmit.",
                "More attention to detail needed.",
                "Consider seeking additional help during office hours.",
                "Shows effort but needs significant improvement."
            ]
        }
        
        for enrollment in enrollments:
            class_assignments = [a for a in assignments if a.class_id == enrollment.class_id]
            for assignment in class_assignments:
                # 90% chance of submission for past due assignments
                if assignment.due_date < datetime.utcnow() and random.random() < 0.9:
                    submission_date = assignment.due_date - timedelta(days=random.randint(0, 3))
                    submission = AssignmentSubmission(
                        student_id=enrollment.student_id,
                        assignment_id=assignment.id,
                        submission_date=submission_date,
                        status="submitted",
                        file_path=f"uploads/assignments/student{enrollment.student_id}_assignment{assignment.id}.pdf"
                    )
                    submissions.append(submission)
                    db.add(submission)
                    
                    # Grade submitted assignments
                    score = random.randint(60, 100)
                    feedback_category = "Excellent" if score >= 90 else \
                                     "Good" if score >= 80 else \
                                     "Average" if score >= 70 else "NeedsImprovement"
                    
                    feedback = random.choice(feedback_templates[feedback_category])
                    grade = Grade(
                        student_id=enrollment.student_id,
                        class_id=enrollment.class_id,
                        assignment_id=assignment.id,
                        score=score,
                        feedback=f"Score: {score}/{assignment.max_score}. {feedback}",
                        graded_by=class_.teacher_id,
                        status="graded",
                        created_at=datetime.utcnow()
                    )
                    grades.append(grade)
                    db.add(grade)
        
        db.commit()
        logger.info(f"{len(submissions)} submissions and {len(grades)} grades created successfully")
        
        # Create attendance records with detailed status and notes
        attendances = []
        absence_reasons = [
            "Medical appointment", "Family emergency", "Religious holiday",
            "School event", "Weather conditions", "Transportation issues",
            "Illness", "Sports competition", "College visit"
        ]
        
        # Generate attendance for the last 60 days
        for i in range(60):
            date = datetime.now().date() - timedelta(days=i)
            # Skip weekends
            if date.weekday() >= 5:
                continue
                
            for enrollment in enrollments:
                # 95% chance of being present
                status = "present" if random.random() < 0.95 else "absent"
                notes = ""
                if status == "absent":
                    notes = random.choice(absence_reasons)
                elif random.random() < 0.1:  # 10% chance of note for present students
                    notes = random.choice([
                        "Participated actively in class discussion",
                        "Helped other students with group work",
                        "Arrived a few minutes late",
                        "Left early for approved appointment"
                    ])
                
                attendance = Attendance(
                    class_id=enrollment.class_id,
                    student_id=enrollment.student_id,
                    date=date,
                    status=status,
                    notes=notes,
                    created_at=datetime.utcnow()
                )
                attendances.append(attendance)
                db.add(attendance)
                
                # Commit in batches to avoid memory issues
                if len(attendances) % 1000 == 0:
                    db.commit()
        
        db.commit()
        logger.info(f"{len(attendances)} attendance records created successfully")
        
        logger.info("Database seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 