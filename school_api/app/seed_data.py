from sqlalchemy.orm import Session
from . import models
from .routers.auth import get_password_hash
import random

def seed_database(db: Session, force: bool = True):
    print("Starting database seeding...")

    try:
        # Clear existing data except admin users
        print("Clearing existing data (preserving admin users)...")
        try:
            db.query(models.ClassEnrollment).delete()
        except:
            pass
        try:
            db.query(models.Class).delete()
        except:
            pass
        try:
            db.query(models.User).filter(models.User.role != "admin").delete()
        except:
            pass
        db.commit()

        # Create test users with specific roles
        users = [
            # Students
            {
                "email": "alex.smith@school.com",
                "full_name": "Alex Smith",
                "role": "student",
                "grade": "10",
                "section": "A",
                "contact": "555-0101"
            },
            {
                "email": "emma.jones@school.com",
                "full_name": "Emma Jones",
                "role": "student",
                "grade": "10",
                "section": "A",
                "contact": "555-0102"
            },
            {
                "email": "lucas.brown@school.com",
                "full_name": "Lucas Brown",
                "role": "student",
                "grade": "11",
                "section": "B",
                "contact": "555-0103"
            },
            {
                "email": "sophia.wilson@school.com",
                "full_name": "Sophia Wilson",
                "role": "student",
                "grade": "11",
                "section": "A",
                "contact": "555-0104"
            },
            {
                "email": "oliver.taylor@school.com",
                "full_name": "Oliver Taylor",
                "role": "student",
                "grade": "10",
                "section": "B",
                "contact": "555-0105"
            },
            {
                "email": "ava.anderson@school.com",
                "full_name": "Ava Anderson",
                "role": "student",
                "grade": "11",
                "section": "B",
                "contact": "555-0106"
            },
            {
                "email": "ethan.thomas@school.com",
                "full_name": "Ethan Thomas",
                "role": "student",
                "grade": "10",
                "section": "A",
                "contact": "555-0107"
            },
            {
                "email": "isabella.martin@school.com",
                "full_name": "Isabella Martin",
                "role": "student",
                "grade": "11",
                "section": "A",
                "contact": "555-0108"
            },
            # Teachers
            {
                "email": "prof.anderson@school.com",
                "full_name": "Prof. Anderson",
                "role": "teacher",
                "subject": "Mathematics",
                "qualification": "Ph.D. in Mathematics",
                "contact": "555-0201",
                "bio": "20 years of teaching experience in advanced mathematics"
            },
            {
                "email": "dr.martinez@school.com",
                "full_name": "Dr. Martinez",
                "role": "teacher",
                "subject": "Physics",
                "qualification": "Ph.D. in Physics",
                "contact": "555-0202",
                "bio": "Research background in quantum mechanics"
            },
            {
                "email": "ms.thompson@school.com",
                "full_name": "Ms. Thompson",
                "role": "teacher",
                "subject": "English Literature",
                "qualification": "M.A. in English Literature",
                "contact": "555-0203",
                "bio": "Published author and experienced educator"
            },
            {
                "email": "mr.roberts@school.com",
                "full_name": "Mr. Roberts",
                "role": "teacher",
                "subject": "Computer Science",
                "qualification": "M.S. in Computer Science",
                "contact": "555-0204",
                "bio": "Former software engineer with teaching passion"
            },
            {
                "email": "mrs.patel@school.com",
                "full_name": "Mrs. Patel",
                "role": "teacher",
                "subject": "Chemistry",
                "qualification": "Ph.D. in Chemistry",
                "contact": "555-0205",
                "bio": "Specializes in organic chemistry and lab safety"
            },
            # Parents
            {
                "email": "david.smith@email.com",
                "full_name": "David Smith",
                "role": "parent",
                "contact": "555-0301"
            },
            {
                "email": "sarah.jones@email.com",
                "full_name": "Sarah Jones",
                "role": "parent",
                "contact": "555-0302"
            },
            {
                "email": "michael.brown@email.com",
                "full_name": "Michael Brown",
                "role": "parent",
                "contact": "555-0303"
            },
            {
                "email": "jennifer.wilson@email.com",
                "full_name": "Jennifer Wilson",
                "role": "parent",
                "contact": "555-0304"
            }
        ]

        # Store user IDs for reference
        user_ids = {}
        teacher_ids = {}

        # Add users
        for user_data in users:
            try:
                role = user_data["role"]
                db_user = models.User(
                    **user_data,
                    is_active=True,
                    hashed_password=get_password_hash("password123")
                )
                db.add(db_user)
                db.flush()
                
                # Store user ID
                user_ids[user_data["email"]] = db_user.id
                if role == "teacher":
                    teacher_ids[user_data["full_name"]] = db_user.id
            except Exception as e:
                print(f"Error adding user {user_data['email']}: {e}")
                db.rollback()
                continue

        # Create sample classes
        classes = [
            {
                "name": "Advanced Mathematics 11A",
                "grade": "11",
                "section": "A",
                "subject": "Mathematics",
                "teacher_name": "Prof. Anderson",
                "capacity": 30,
                "schedule": "Mon, Wed 9:00-10:30",
                "room": "Room 201",
                "description": "Advanced mathematics covering calculus and linear algebra"
            },
            {
                "name": "Physics 11B",
                "grade": "11",
                "section": "B",
                "subject": "Physics",
                "teacher_name": "Dr. Martinez",
                "capacity": 25,
                "schedule": "Tue, Thu 11:00-12:30",
                "room": "Lab 301",
                "description": "Advanced physics with practical experiments"
            },
            {
                "name": "English Literature 10A",
                "grade": "10",
                "section": "A",
                "subject": "English Literature",
                "teacher_name": "Ms. Thompson",
                "capacity": 35,
                "schedule": "Mon, Wed, Fri 13:00-14:00",
                "room": "Room 101",
                "description": "Analysis of classic literature and creative writing"
            },
            {
                "name": "Programming Fundamentals",
                "grade": "10",
                "section": "A",
                "subject": "Computer Science",
                "teacher_name": "Mr. Roberts",
                "capacity": 25,
                "schedule": "Tue, Thu 14:00-15:30",
                "room": "Lab 102",
                "description": "Introduction to programming concepts and practices"
            },
            {
                "name": "Chemistry Lab",
                "grade": "11",
                "section": "B",
                "subject": "Chemistry",
                "teacher_name": "Mrs. Patel",
                "capacity": 20,
                "schedule": "Wed, Fri 10:00-11:30",
                "room": "Lab 201",
                "description": "Hands-on chemistry experiments and lab work"
            }
        ]

        # Store class IDs
        class_ids = {}

        # Add classes
        for class_data in classes:
            try:
                teacher_name = class_data.pop("teacher_name")
                teacher_id = teacher_ids.get(teacher_name)
                if teacher_id:
                    db_class = models.Class(
                        **class_data,
                        teacher_id=teacher_id,
                        status="active"
                    )
                    db.add(db_class)
                    db.flush()
                    class_ids[db_class.name] = db_class.id
            except Exception as e:
                print(f"Error adding class {class_data['name']}: {e}")
                db.rollback()
                continue

        # Link parents to students (first 4 students to parents)
        student_emails = [email for email, user_id in user_ids.items() if "student" in email][:4]
        parent_emails = [email for email, user_id in user_ids.items() if "parent" in email]
        
        for student_email, parent_email in zip(student_emails, parent_emails):
            try:
                student = db.query(models.User).filter(models.User.email == student_email).first()
                parent = db.query(models.User).filter(models.User.email == parent_email).first()
                if student and parent:
                    student.parent_id = parent.id
                    print(f"Linked student {student.full_name} to parent {parent.full_name}")
            except Exception as e:
                print(f"Error linking student {student_email} to parent {parent_email}: {e}")
                continue

        # Add class enrollments
        enrollments = [
            # Programming Fundamentals (Mr. Roberts' class)
            {
                "class_name": "Programming Fundamentals",
                "student_emails": [
                    "alex.smith@school.com",
                    "emma.jones@school.com",
                    "ethan.thomas@school.com"
                ]
            },
            # Chemistry Lab (Mrs. Patel's class)
            {
                "class_name": "Chemistry Lab",
                "student_emails": [
                    "lucas.brown@school.com",
                    "ava.anderson@school.com"
                ]
            },
            # Advanced Mathematics (Prof. Anderson's class)
            {
                "class_name": "Advanced Mathematics 11A",
                "student_emails": [
                    "sophia.wilson@school.com",
                    "isabella.martin@school.com"
                ]
            }
        ]

        # Process enrollments
        for enrollment_data in enrollments:
            try:
                class_obj = db.query(models.Class).filter(
                    models.Class.name == enrollment_data["class_name"]
                ).first()
                
                if not class_obj:
                    print(f"Class {enrollment_data['class_name']} not found")
                    continue
                
                for student_email in enrollment_data["student_emails"]:
                    try:
                        student = db.query(models.User).filter(
                            models.User.email == student_email
                        ).first()
                        
                        if not student:
                            print(f"Student {student_email} not found")
                            continue
                            
                        enrollment = models.ClassEnrollment(
                            student_id=student.id,
                            class_id=class_obj.id,
                            status="active"
                        )
                        db.add(enrollment)
                        print(f"Enrolled {student.full_name} in {class_obj.name}")
                    except Exception as e:
                        print(f"Error enrolling student {student_email}: {e}")
                        continue
                        
            except Exception as e:
                print(f"Error processing class {enrollment_data['class_name']}: {e}")
                continue

        try:
            db.commit()
            print("Successfully added sample data to database!")
        except Exception as e:
            print(f"Error committing changes to database: {e}")
            db.rollback()
    except Exception as e:
        print(f"Error during database seeding: {e}")
        db.rollback() 