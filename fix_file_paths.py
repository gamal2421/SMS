from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from school_api.app.models import AssignmentSubmission, User, Assignment

# Database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///school.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def fix_file_paths():
    db = SessionLocal()
    try:
        # Get all submissions with student info
        submissions = db.query(
            AssignmentSubmission, 
            User
        ).join(
            User,
            User.id == AssignmentSubmission.student_id
        ).all()
        
        # Update file paths to use correct format
        for submission, student in submissions:
            old_path = submission.file_path
            
            # Map student names to correct file extensions
            file_types = {
                "Emma Brown": "pdf",
                "James Wilson": "py",
                "Sophia Lee": "docx",
                "Oliver Chen": "zip"
            }
            
            # Get the correct file extension for this student
            file_type = file_types.get(student.full_name, "txt")
            
            # Create the correct file path
            new_path = f"uploads/submissions/student{submission.student_id}_assignment1.{file_type}"
            
            # Update the path in the database
            submission.file_path = new_path
            print(f"Updated path for {student.full_name}:")
            print(f"  Old: {old_path}")
            print(f"  New: {new_path}")
        
        db.commit()
        print("\nFile paths updated successfully")
        
    except Exception as e:
        print(f"Error updating file paths: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_file_paths() 