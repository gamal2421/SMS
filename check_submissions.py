from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from school_api.app.models import AssignmentSubmission, User, Assignment

# Database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///school.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_submissions():
    db = SessionLocal()
    try:
        submissions = db.query(AssignmentSubmission).all()
        print(f"Total submissions: {len(submissions)}")
        
        for submission in submissions:
            student = db.query(User).filter(User.id == submission.student_id).first()
            assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
            
            print(f"\nSubmission Details:")
            print(f"Student: {student.full_name} (ID: {student.id})")
            print(f"Assignment: {assignment.title} (ID: {assignment.id})")
            print(f"File Path: {submission.file_path}")
            print(f"Status: {submission.status}")
            print(f"Submission Date: {submission.submission_date}")
            
    except Exception as e:
        print(f"Error checking submissions: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    check_submissions() 