import os
import sys
from pathlib import Path

# Get the absolute path to the school-api directory
SCHOOL_API_DIR = str(Path(__file__).resolve().parent)
sys.path.append(SCHOOL_API_DIR)

with open("test_output.txt", "w") as f:
    def log(msg):
        print(msg)
        f.write(msg + "\n")
        f.flush()

    log(f"Python path: {sys.path}")
    log(f"Current directory: {os.getcwd()}")
    log(f"School API directory: {SCHOOL_API_DIR}")

    try:
        from app.database import SessionLocal, engine
        log("Successfully imported database modules")
        
        from app.models import Base, User, Class, ClassEnrollment
        log("Successfully imported model modules")
        
        from app.seed_data import seed_database
        log("Successfully imported seed_data module")
        
        # Try to create a database session
        db = SessionLocal()
        log("Successfully created database session")
        
        # Try to query the database
        teachers = db.query(User).filter(User.role == "teacher").all()
        log(f"Found {len(teachers)} teachers in database")
        
        # List the teachers
        for teacher in teachers:
            log(f"- {teacher.full_name} (ID: {teacher.id})")
            classes = db.query(Class).filter(Class.teacher_id == teacher.id).all()
            for class_ in classes:
                log(f"  - Class: {class_.name} (ID: {class_.id})")
                enrollments = db.query(ClassEnrollment).filter(
                    ClassEnrollment.class_id == class_.id,
                    ClassEnrollment.status == "active"
                ).all()
                log(f"    - Active enrollments: {len(enrollments)}")
                for enrollment in enrollments:
                    student = db.query(User).filter(User.id == enrollment.student_id).first()
                    log(f"      - {student.full_name} (ID: {student.id})")
        
        db.close()
        log("Successfully closed database session")
        
    except Exception as e:
        log(f"Error during imports/database operations: {e}")
        import traceback
        traceback.print_exc(file=f) 