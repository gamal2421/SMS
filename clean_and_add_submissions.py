from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from school_api.app.models import AssignmentSubmission, User, Assignment
from datetime import datetime
import os
import shutil

# Database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///school.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def clean_and_add_submissions():
    db = SessionLocal()
    try:
        # 1. Clean old submissions
        print("Cleaning old submissions...")
        db.query(AssignmentSubmission).delete()
        db.commit()
        print("Old submissions deleted")

        # 2. Get test students (create if they don't exist)
        test_students = []
        for i in range(1, 3):
            student = db.query(User).filter(
                User.email == f"test.student{i}@school.com"
            ).first()
            
            if not student:
                student = User(
                    email=f"test.student{i}@school.com",
                    full_name=f"Test Student {i}",
                    role="student",
                    grade="10",
                    section="A",
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                db.add(student)
                db.commit()
                db.refresh(student)
            
            test_students.append(student)
            print(f"Student ready: {student.full_name} (ID: {student.id})")

        # 3. Get or create test assignment
        assignment = db.query(Assignment).filter(Assignment.id == 1).first()
        if not assignment:
            print("Creating test assignment...")
            assignment = Assignment(
                title="Programming Assignment 1",
                description="Test assignment for submissions",
                class_id=1,  # Assuming class ID 1 exists
                teacher_id=1,  # Assuming teacher ID 1 exists
                due_date=datetime.utcnow(),
                max_score=100,
                status="active",
                created_at=datetime.utcnow()
            )
            db.add(assignment)
            db.commit()
            db.refresh(assignment)
            print(f"Created assignment: {assignment.title} (ID: {assignment.id})")

        # 4. Create new submissions
        submissions = []
        submission_data = [
            ("test_submission1.pdf", test_students[0]),
            ("test_submission2.py", test_students[1])
        ]

        # Create the exact directory structure the frontend expects
        upload_dir = "uploads/assignments/assignments/submissions"
        os.makedirs(upload_dir, exist_ok=True)

        for file_name, student in submission_data:
            # Set up file paths to match frontend expectation exactly
            file_path = f"assignments/assignments/submissions/{file_name}"  # Database path
            full_path = os.path.join('uploads', file_path)  # Full file system path
            
            # Create the file with test content
            with open(full_path, 'w') as f:
                if file_name.endswith('.pdf'):
                    f.write(f"Test Submission\nStudent: {student.full_name}\nDate: {datetime.now().strftime('%Y-%m-%d')}\n\nThis is a test PDF submission.")
                else:
                    f.write(f'"""\nTest Submission\nStudent: {student.full_name}\nDate: {datetime.now().strftime("%Y-%m-%d")}\n"""\n\ndef test_function():\n    return "This is a test submission"\n')
            
            # Create submission record
            submission = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=student.id,
                content=f"Test submission from {student.full_name}",
                file_path=file_path,
                submission_date=datetime.utcnow(),
                status="submitted",
                created_at=datetime.utcnow()
            )
            db.add(submission)
            submissions.append(submission)
            print(f"\nCreated submission for {student.full_name}:")
            print(f"  Database path: {file_path}")
            print(f"  File location: {full_path}")
            print(f"  Access URL: http://127.0.0.1:5500/uploads/{file_path}")

        db.commit()
        print(f"\nAdded {len(submissions)} new submissions successfully")

    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_and_add_submissions() 