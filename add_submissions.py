from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from school_api.app.models import AssignmentSubmission, User, Assignment
from datetime import datetime, timedelta

# Database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///school.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_submissions():
    db = SessionLocal()
    try:
        # Get student IDs (Emma Brown, James Wilson, Sophia Lee, Oliver Chen)
        students = db.query(User).filter(
            User.role == "student",
            User.full_name.in_(["Emma Brown", "James Wilson", "Sophia Lee", "Oliver Chen"])
        ).all()
        
        # Get assignment 1 (Programming Fundamentals)
        assignment = db.query(Assignment).filter(Assignment.id == 1).first()
        
        if not assignment:
            print("Assignment not found")
            return
            
        # Create submissions with different file types and submission times
        submissions = []
        file_types = {
            "Emma Brown": "pdf",
            "James Wilson": "py",
            "Sophia Lee": "docx",
            "Oliver Chen": "zip"
        }
        
        base_time = datetime.utcnow()
        for i, student in enumerate(students):
            file_type = file_types.get(student.full_name, "txt")
            file_path = f"uploads/submissions/student{i+1}_assignment1.{file_type}"
            
            # Stagger submission times to show different submission dates
            submission_time = base_time - timedelta(hours=i*2)
            
            submission = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=student.id,
                content=f"Submission for {assignment.title} by {student.full_name}",
                file_path=file_path,
                submission_date=submission_time,
                status="submitted",
                created_at=submission_time
            )
            submissions.append(submission)
            db.add(submission)
        
        db.commit()
        print(f"Added {len(submissions)} submissions successfully")
        
        # Print submission details
        for submission in submissions:
            student = next((s for s in students if s.id == submission.student_id), None)
            print(f"\nSubmission Details:")
            print(f"Student: {student.full_name if student else 'Unknown'}")
            print(f"File: {submission.file_path}")
            print(f"Date: {submission.submission_date}")
            
    except Exception as e:
        print(f"Error adding submissions: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_submissions() 