import os
import sys
from pathlib import Path

# Get the absolute path to the school-api directory
SCHOOL_API_DIR = str(Path(__file__).resolve().parent)
sys.path.append(SCHOOL_API_DIR)

from app.database import SessionLocal, engine
from app.models import Base, User, Class, ClassEnrollment
from app.seed_data import seed_database

def reset_database():
    print("Resetting database...")
    try:
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        print("Dropped all tables")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Created all tables")
        
        # Create a new session
        db = SessionLocal()
        try:
            # Seed the database
            seed_database(db)
            
            # Verify the data
            print("\nVerifying database contents:")
            
            # Check teachers
            teachers = db.query(User).filter(User.role == "teacher").all()
            print(f"\nFound {len(teachers)} teachers:")
            for teacher in teachers:
                print(f"\nTeacher: {teacher.full_name} (ID: {teacher.id})")
                
                # Get their classes
                classes = db.query(Class).filter(Class.teacher_id == teacher.id).all()
                print(f"Classes for {teacher.full_name}:")
                for class_ in classes:
                    # Get active enrollments
                    active_enrollments = db.query(ClassEnrollment).filter(
                        ClassEnrollment.class_id == class_.id,
                        ClassEnrollment.status == "active"
                    ).all()
                    
                    print(f"- {class_.name} (ID: {class_.id})")
                    print(f"  Active enrollments: {len(active_enrollments)}")
                    
                    # List enrolled students
                    for enrollment in active_enrollments:
                        student = db.query(User).filter(User.id == enrollment.student_id).first()
                        print(f"  - {student.full_name} (ID: {student.id})")
                    
                    # Update current_students count
                    class_.current_students = len(active_enrollments)
                
                # Commit the changes
                db.commit()
            
            print("\nDatabase reset and verification complete!")
            
        except Exception as e:
            print(f"Error during database operations: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error resetting database: {e}")

if __name__ == "__main__":
    reset_database() 