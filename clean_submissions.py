from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from school_api.app.models import AssignmentSubmission, User, Assignment
from datetime import datetime
import os

# Database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///school.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def clean_submissions():
    db = SessionLocal()
    try:
        # First, delete all existing submissions
        db.query(AssignmentSubmission).delete()
        db.commit()
        print("Cleared existing submissions")
        
        # Get student IDs
        students = db.query(User).filter(
            User.role == "student",
            User.full_name.in_(["Emma Brown", "James Wilson", "Sophia Lee", "Oliver Chen"])
        ).all()
        
        # Get assignment 1
        assignment = db.query(Assignment).filter(Assignment.id == 1).first()
        
        if not assignment:
            print("Assignment not found")
            return
            
        # Create fresh submissions with correct paths
        submissions = []
        file_types = {
            "Emma Brown": "pdf",
            "James Wilson": "py",
            "Sophia Lee": "docx",
            "Oliver Chen": "zip"
        }
        
        base_time = datetime.utcnow()
        for student in students:
            file_type = file_types.get(student.full_name, "txt")
            file_path = f"uploads/submissions/student{student.id}_assignment1.{file_type}"
            
            # Create submission
            submission = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=student.id,
                content=f"Submission for {assignment.title} by {student.full_name}",
                file_path=file_path,
                submission_date=base_time,
                status="submitted",
                created_at=base_time
            )
            submissions.append(submission)
            db.add(submission)
            
            print(f"\nCreated submission for {student.full_name}:")
            print(f"  File path: {file_path}")
        
        db.commit()
        print(f"\nAdded {len(submissions)} submissions successfully")
        
    except Exception as e:
        print(f"Error cleaning submissions: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_submissions() 