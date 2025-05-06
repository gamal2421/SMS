from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user, get_password_hash
from pydantic import BaseModel

# Add new response model for user credentials
class UserCredentialsResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    password: str  # This will store the test password
    subject: str | None = None
    grade: str | None = None
    section: str | None = None
    contact: str | None = None
    is_active: bool = True

    class Config:
        from_attributes = True

router = APIRouter(
    tags=["Admin"],
    dependencies=[Depends(get_current_user)]
)

# Dependency to check if user is admin
async def get_current_admin(
    current_user: models.User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access admin resources"
        )
    return current_user

# User Management Endpoints
@router.get("/users/credentials", response_model=List[UserCredentialsResponse])
async def get_users_credentials(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users with their test credentials. Admin access only."""
    # Verify admin role
    if current_admin.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can access this endpoint"
        )
    
    # Get all users
    users = db.query(models.User).all()
    
    # Map test passwords based on role
    test_passwords = {
        "admin": "admin123",
        "teacher": "teacher123",
        "student": "student123",
        "parent": "parent123"
    }
    
    # Create response with test passwords
    user_credentials = []
    for user in users:
        user_dict = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "password": test_passwords.get(user.role, "default123"),
            "subject": user.subject if hasattr(user, "subject") else None,
            "grade": user.grade if hasattr(user, "grade") else None,
            "section": user.section if hasattr(user, "section") else None,
            "contact": user.contact if hasattr(user, "contact") else None,
            "is_active": user.is_active
        }
        user_credentials.append(UserCredentialsResponse(**user_dict))
    
    return user_credentials

@router.get("/users", response_model=List[schemas.User])
async def get_users(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users"""
    try:
        users = db.query(models.User).all()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/users/{user_id}", response_model=schemas.User)
async def get_user(
    user_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a specific user by ID"""
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/users/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a user's information"""
    try:
        # Get existing user
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user fields
        for field, value in user_update.dict(exclude_unset=True).items():
            if field == "password":
                setattr(db_user, "hashed_password", get_password_hash(value))
            else:
                setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a user"""
    try:
        # Get user
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is a teacher with assigned classes
        if db_user.role == "teacher":
            classes = db.query(models.Class).filter(models.Class.teacher_id == user_id).all()
            if classes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete teacher with assigned classes. Please reassign or delete the classes first."
                )
        
        # Delete user
        db.delete(db_user)
        db.commit()
        return {"message": f"User {db_user.full_name} deleted successfully"}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Class Management Endpoints
@router.get("/classes", response_model=List[schemas.Class])
async def get_classes(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all classes"""
    try:
        # Query classes with teacher information
        classes = db.query(models.Class).options(
            joinedload(models.Class.teacher),
            joinedload(models.Class.enrolled_students)
        ).all()
        
        # Process the classes to include only active enrollments in the count
        class_data = []
        for class_ in classes:
            active_enrollments = []
            for enrollment in class_.enrolled_students:
                if enrollment.status == "active":
                    student = db.query(models.User).filter(models.User.id == enrollment.student_id).first()
                    if student:
                        active_enrollments.append({
                            "id": student.id,
                            "email": student.email,
                            "full_name": student.full_name,
                            "role": student.role,
                            "grade": student.grade,
                            "section": student.section
                        })

            teacher_data = None
            if class_.teacher:
                teacher_data = {
                    "id": class_.teacher.id,
                    "email": class_.teacher.email,
                    "full_name": class_.teacher.full_name,
                    "subject": class_.teacher.subject,
                    "role": class_.teacher.role,
                    "created_at": class_.teacher.created_at
                }

            class_dict = {
                "id": class_.id,
                "name": class_.name,
                "grade": class_.grade,
                "section": class_.section,
                "subject": class_.subject,
                "teacher_id": class_.teacher_id,
                "teacher": teacher_data,
                "capacity": class_.capacity,
                "current_students": len(active_enrollments),
                "schedule": class_.schedule,
                "room": class_.room,
                "status": class_.status,
                "created_at": class_.created_at,
                "updated_at": class_.updated_at,
                "enrolled_students": active_enrollments
            }
            class_data.append(class_dict)
        
        return class_data
    except Exception as e:
        print(f"Error in get_classes: {str(e)}")  # Add logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/classes/{class_id}", response_model=schemas.Class)
async def get_class(
    class_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a specific class by ID"""
    try:
        # Query class with teacher and enrollment information using joinedload
        class_ = db.query(models.Class).options(
            joinedload(models.Class.teacher),
            joinedload(models.Class.enrolled_students)
        ).filter(models.Class.id == class_id).first()
        
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found"
            )
        
        # Process enrolled students
        active_enrollments = []
        for enrollment in class_.enrolled_students:
            if enrollment.status == "active":
                student = db.query(models.User).filter(models.User.id == enrollment.student_id).first()
                if student:
                    active_enrollments.append({
                        "id": student.id,
                        "email": student.email,
                        "full_name": student.full_name,
                        "role": student.role,
                        "grade": student.grade,
                        "section": student.section
                    })

        # Format teacher data
        teacher_data = None
        if class_.teacher:
            teacher_data = {
                "id": class_.teacher.id,
                "email": class_.teacher.email,
                "full_name": class_.teacher.full_name,
                "subject": class_.teacher.subject,
                "role": class_.teacher.role,
                "created_at": class_.teacher.created_at
            }

        # Create response
        response = {
            "id": class_.id,
            "name": class_.name,
            "grade": class_.grade,
            "section": class_.section,
            "subject": class_.subject,
            "teacher_id": class_.teacher_id,
            "teacher": teacher_data,
            "capacity": class_.capacity,
            "current_students": len(active_enrollments),
            "schedule": class_.schedule,
            "room": class_.room,
            "status": class_.status,
            "created_at": class_.created_at,
            "updated_at": class_.updated_at,
            "enrolled_students": active_enrollments
        }

        return response
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in get_class: {str(e)}")  # Add logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/classes", response_model=schemas.Class)
async def create_class(
    class_: schemas.ClassCreate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new class"""
    try:
        # Check if class name already exists
        existing_class = db.query(models.Class).filter(models.Class.name == class_.name).first()
        if existing_class:
            # Get the next available section for suggestion
            base_name = class_.name.rsplit(' ', 1)[0]  # Get everything before the section
            section = class_.name[-1]  # Get the current section letter
            
            # Find all classes with the same base name
            similar_classes = db.query(models.Class).filter(
                models.Class.name.like(f"{base_name} %")
            ).all()
            
            # Get all used sections
            used_sections = {c.name[-1] for c in similar_classes}
            
            # Find the next available section
            next_section = section
            while next_section in used_sections:
                next_section = chr(ord(next_section) + 1)
                if ord(next_section) > ord('Z'):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"A class with the name '{class_.name}' already exists and no more sections are available"
                    )
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A class with the name '{class_.name}' already exists"
            )
        
        # Check if teacher exists
        teacher = db.query(models.User).filter(
            models.User.id == class_.teacher_id,
            models.User.role == "teacher"
        ).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found"
            )
        
        # Create new class
        db_class = models.Class(**class_.dict())
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
        return db_class
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/classes/{class_id}", response_model=schemas.Class)
async def update_class(
    class_id: int,
    class_update: schemas.ClassUpdate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a class's information"""
    try:
        # Get existing class
        db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
        if not db_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found"
            )
        
        # If name is being updated, check for duplicates
        if class_update.name and class_update.name != db_class.name:
            existing_class = db.query(models.Class).filter(
                models.Class.name == class_update.name,
                models.Class.id != class_id
            ).first()
            if existing_class:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A class with the name '{class_update.name}' already exists"
                )
        
        # If teacher_id is being updated, verify the new teacher exists
        if class_update.teacher_id is not None:
            teacher = db.query(models.User).filter(
                models.User.id == class_update.teacher_id,
                models.User.role == "teacher"
            ).first()
            if not teacher:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Teacher not found"
                )
        
        # Update class fields
        for field, value in class_update.dict(exclude_unset=True).items():
            setattr(db_class, field, value)
        
        db.commit()
        db.refresh(db_class)
        return db_class
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/classes/{class_id}")
async def delete_class(
    class_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a class"""
    try:
        # Get class
        db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
        if not db_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found"
            )
        
        # Delete class
        db.delete(db_class)
        db.commit()
        return {"message": f"Class {db_class.name} deleted successfully"}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

class DashboardStats(BaseModel):
    students: int
    teachers: int
    parents: int
    classes: int

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    try:
        stats = DashboardStats(
            students=db.query(models.User).filter(models.User.role == "student").count(),
            teachers=db.query(models.User).filter(models.User.role == "teacher").count(),
            parents=db.query(models.User).filter(models.User.role == "parent").count(),
            classes=db.query(models.Class).filter(models.Class.status == "active").count()
        )
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/students", response_model=List[schemas.User])
async def get_students(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all students"""
    try:
        students = db.query(models.User).filter(models.User.role == "student").all()
        return students
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/students/{student_id}", response_model=schemas.User)
async def get_student(
    student_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a specific student by ID"""
    try:
        student = db.query(models.User).filter(
            models.User.id == student_id,
            models.User.role == "student"
        ).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        return student
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/students", response_model=schemas.User)
async def create_student(
    student: schemas.UserCreate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new student"""
    try:
        # Force role to be student
        student.role = "student"
        
        # Check if email already exists
        if db.query(models.User).filter(models.User.email == student.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(student.password)
        
        # Create new student with all fields
        db_student = models.User(
            email=student.email,
            full_name=student.full_name,
            hashed_password=hashed_password,
            role="student",
            grade=student.grade,
            section=student.section,
            contact=student.contact,
            is_active=True
        )
        
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/students/{student_id}", response_model=schemas.User)
async def update_student(
    student_id: int,
    student_update: schemas.UserUpdate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a student's information"""
    try:
        # Get existing student
        student = db.query(models.User).filter(
            models.User.id == student_id,
            models.User.role == "student"
        ).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        # Update student fields
        for field, value in student_update.dict(exclude_unset=True).items():
            if field == "password":
                setattr(student, "hashed_password", get_password_hash(value))
            else:
                setattr(student, field, value)
        
        db.commit()
        db.refresh(student)
        return student
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/students/{student_id}")
async def delete_student(
    student_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a student"""
    try:
        # Get student
        student = db.query(models.User).filter(
            models.User.id == student_id,
            models.User.role == "student"
        ).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        # Delete student
        db.delete(student)
        db.commit()
        return {"message": f"Student {student.full_name} deleted successfully"}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/teachers", response_model=List[schemas.User])
async def get_teachers(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all teachers"""
    try:
        teachers = db.query(models.User).filter(models.User.role == "teacher").all()
        return teachers
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/teachers", response_model=schemas.User)
async def create_teacher(
    teacher: schemas.UserCreate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new teacher"""
    try:
        # Force role to be teacher
        teacher.role = "teacher"
        
        # Check if email already exists
        if db.query(models.User).filter(models.User.email == teacher.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(teacher.password)
        
        # Create new teacher with all fields
        db_teacher = models.User(
            email=teacher.email,
            full_name=teacher.full_name,
            hashed_password=hashed_password,
            role="teacher",
            subject=teacher.subject,
            contact=teacher.contact,
            qualification=teacher.qualification,
            is_active=True
        )
        
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
        return db_teacher
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/teachers/{teacher_id}", response_model=schemas.User)
async def get_teacher(
    teacher_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a specific teacher by ID"""
    try:
        teacher = db.query(models.User).filter(
            models.User.id == teacher_id,
            models.User.role == "teacher"
        ).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found"
            )
        return teacher
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/teachers/{teacher_id}", response_model=schemas.User)
async def update_teacher(
    teacher_id: int,
    teacher_update: schemas.UserUpdate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a teacher's information"""
    try:
        # Get existing teacher
        teacher = db.query(models.User).filter(
            models.User.id == teacher_id,
            models.User.role == "teacher"
        ).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found"
            )
        
        # Update teacher fields
        for field, value in teacher_update.dict(exclude_unset=True).items():
            if field == "password":
                setattr(teacher, "hashed_password", get_password_hash(value))
            else:
                setattr(teacher, field, value)
        
        db.commit()
        db.refresh(teacher)
        return teacher
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/teachers/{teacher_id}")
async def delete_teacher(
    teacher_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a teacher"""
    try:
        # Get teacher
        teacher = db.query(models.User).filter(
            models.User.id == teacher_id,
            models.User.role == "teacher"
        ).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found"
            )
        
        # Check if teacher has assigned classes
        classes = db.query(models.Class).filter(models.Class.teacher_id == teacher_id).all()
        if classes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete teacher with assigned classes. Please reassign or delete the classes first."
            )
        
        # Delete teacher
        db.delete(teacher)
        db.commit()
        return {"message": f"Teacher {teacher.full_name} deleted successfully"}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/parents", response_model=List[schemas.User])
async def get_parents(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all parents"""
    try:
        parents = db.query(models.User).filter(models.User.role == "parent").all()
        return parents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/parents/{parent_id}", response_model=schemas.User)
async def get_parent(
    parent_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a specific parent by ID"""
    try:
        parent = db.query(models.User).filter(
            models.User.id == parent_id,
            models.User.role == "parent"
        ).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
        return parent
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/parents", response_model=schemas.User)
async def create_parent(
    parent: schemas.UserCreate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new parent"""
    try:
        # Force role to be parent
        parent.role = "parent"
        
        # Check if email already exists
        existing_user = db.query(models.User).filter(models.User.email == parent.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new parent user
        hashed_password = get_password_hash(parent.password)
        db_parent = models.User(
            email=parent.email,
            hashed_password=hashed_password,
            full_name=parent.full_name,
            role="parent",
            contact=parent.contact,
            is_active=True
        )
        db.add(db_parent)
        db.commit()
        db.refresh(db_parent)
        return db_parent
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/parents/{parent_id}", response_model=schemas.User)
async def update_parent(
    parent_id: int,
    parent_update: schemas.UserUpdate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a parent's information"""
    try:
        db_parent = db.query(models.User).filter(
            models.User.id == parent_id,
            models.User.role == "parent"
        ).first()
        if not db_parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
        
        # Update fields
        for field, value in parent_update.dict(exclude_unset=True).items():
            if field == "password":
                setattr(db_parent, "hashed_password", get_password_hash(value))
            else:
                setattr(db_parent, field, value)
        
        db.commit()
        db.refresh(db_parent)
        return db_parent
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/parents/{parent_id}")
async def delete_parent(
    parent_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a parent"""
    try:
        db_parent = db.query(models.User).filter(
            models.User.id == parent_id,
            models.User.role == "parent"
        ).first()
        if not db_parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
        
        db.delete(db_parent)
        db.commit()
        return {"message": "Parent deleted successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Parent-Student Relationship Endpoints
@router.get("/parents/{parent_id}/students", response_model=List[schemas.User])
async def get_parent_students(
    parent_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all students linked to a parent"""
    try:
        # Check if parent exists
        parent = db.query(models.User).filter(
            models.User.id == parent_id,
            models.User.role == "parent"
        ).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
        
        # Get all students linked to this parent
        students = db.query(models.User).filter(
            models.User.parent_id == parent_id,
            models.User.role == "student"
        ).all()
        
        # Return empty list if no students found
        return students or []
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in get_parent_students for parent_id {parent_id}: {str(e)}")
        # Return empty list instead of 500 error
        return []

@router.post("/parents/{parent_id}/students/{student_id}")
async def link_parent_student(
    parent_id: int,
    student_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Link a parent to a student"""
    try:
        print(f"Attempting to link student {student_id} to parent {parent_id}")
        
        # Check if parent exists
        parent = db.query(models.User).filter(
            models.User.id == parent_id,
            models.User.role == "parent"
        ).first()
        if not parent:
            print(f"Parent {parent_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent with ID {parent_id} not found"
            )
        
        # Check if student exists
        student = db.query(models.User).filter(
            models.User.id == student_id,
            models.User.role == "student"
        ).first()
        if not student:
            print(f"Student {student_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID {student_id} not found"
            )
        
        # Check if student is already linked to this parent
        if student.parent_id == parent_id:
            print(f"Student {student_id} is already linked to parent {parent_id}")
            return {"message": f"Student {student.full_name} is already linked to parent {parent.full_name}"}
        
        # If student is linked to another parent, unlink first
        if student.parent_id is not None and student.parent_id != parent_id:
            old_parent = db.query(models.User).filter(
                models.User.id == student.parent_id
            ).first()
            old_parent_name = old_parent.full_name if old_parent else "Unknown"
            print(f"Student {student_id} is already linked to parent {student.parent_id}, unlinking")
            
            # Don't raise exception, just unlink and continue
            student.parent_id = None
            db.commit()
            print(f"Student {student_id} unlinked from parent {old_parent_name}")
        
        # Create parent-student relationship
        student.parent_id = parent_id
        db.commit()
        db.refresh(student)
        
        print(f"Successfully linked student {student_id} to parent {parent_id}")
        return {"message": f"Student {student.full_name} linked to parent {parent.full_name}"}
    except HTTPException as he:
        print(f"HTTP Exception in link_parent_student: {he.detail}")
        raise he
    except Exception as e:
        print(f"Exception in link_parent_student: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/parents/{parent_id}/students/{student_id}")
async def unlink_parent_student(
    parent_id: int,
    student_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Unlink a parent from a student"""
    try:
        print(f"Attempting to unlink student {student_id} from parent {parent_id}")
        
        # First, check if parent exists
        parent = db.query(models.User).filter(
            models.User.id == parent_id,
            models.User.role == "parent"
        ).first()
        if not parent:
            print(f"Parent {parent_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent with ID {parent_id} not found"
            )
            
        # Then, check if student exists
        student = db.query(models.User).filter(
            models.User.id == student_id,
            models.User.role == "student"
        ).first()
        if not student:
            print(f"Student {student_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID {student_id} not found"
            )
        
        # Check if student is actually linked to this parent
        if student.parent_id != parent_id:
            print(f"Student {student_id} is not linked to parent {parent_id}")
            # Don't throw an error, just return success since the end state is what we want
            return {"message": f"Student {student.full_name} is not linked to this parent"}
        
        # Remove parent-student relationship
        student.parent_id = None
        db.commit()
        db.refresh(student)
        
        print(f"Successfully unlinked student {student_id} from parent {parent_id}")
        return {"message": f"Student {student.full_name} unlinked from parent {parent.full_name}"}
    except HTTPException as he:
        print(f"HTTP Exception in unlink_parent_student: {he.detail}")
        raise he
    except Exception as e:
        print(f"Exception in unlink_parent_student: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/students/promote", response_model=List[schemas.User])
async def promote_students(
    promotion: schemas.StudentPromotion,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Promote students from one grade/section to another"""
    try:
        # Get all students in the source grade/section
        students = db.query(models.User).filter(
            models.User.role == "student",
            models.User.grade == promotion.from_grade,
            models.User.section == promotion.from_section
        ).all()

        if not students:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No students found in grade {promotion.from_grade} section {promotion.from_section}"
            )

        # Update student grades and sections
        for student in students:
            student.grade = promotion.to_grade
            student.section = promotion.to_section

        # Get all classes for the source grade/section
        old_classes = db.query(models.Class).filter(
            models.Class.grade == promotion.from_grade,
            models.Class.section == promotion.from_section
        ).all()

        # Get all classes for the target grade/section
        new_classes = db.query(models.Class).filter(
            models.Class.grade == promotion.to_grade,
            models.Class.section == promotion.to_section
        ).all()

        # Update class enrollments
        for student in students:
            # Remove old enrollments
            for old_class in old_classes:
                db.query(models.ClassEnrollment).filter(
                    models.ClassEnrollment.student_id == student.id,
                    models.ClassEnrollment.class_id == old_class.id
                ).delete()

            # Add new enrollments
            for new_class in new_classes:
                enrollment = models.ClassEnrollment(
                    student_id=student.id,
                    class_id=new_class.id,
                    status="active"
                )
                db.add(enrollment)

        # Update class student counts
        for old_class in old_classes:
            active_enrollments = db.query(models.ClassEnrollment).filter(
                models.ClassEnrollment.class_id == old_class.id,
                models.ClassEnrollment.status == "active"
            ).count()
            old_class.current_students = active_enrollments

        for new_class in new_classes:
            active_enrollments = db.query(models.ClassEnrollment).filter(
                models.ClassEnrollment.class_id == new_class.id,
                models.ClassEnrollment.status == "active"
            ).count()
            new_class.current_students = active_enrollments

        db.commit()
        return students

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/classes/{class_id}/enrollments", response_model=List[schemas.ClassEnrollment])
async def enroll_students(
    class_id: int,
    student_ids: List[int],
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Enroll multiple students in a class"""
    try:
        # Verify class exists
        class_ = db.query(models.Class).filter(models.Class.id == class_id).first()
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found"
            )

        # Check if adding these students would exceed class capacity
        current_enrollments = db.query(models.ClassEnrollment).filter(
            models.ClassEnrollment.class_id == class_id,
            models.ClassEnrollment.status == "active"
        ).count()

        if current_enrollments + len(student_ids) > class_.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot enroll {len(student_ids)} students. Class capacity would be exceeded."
            )

        # Verify all students exist and are not already enrolled
        enrollments = []
        for student_id in student_ids:
            # Check if student exists
            student = db.query(models.User).filter(
                models.User.id == student_id,
                models.User.role == "student"
            ).first()
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Student with ID {student_id} not found"
                )

            # Check if student is already enrolled
            existing_enrollment = db.query(models.ClassEnrollment).filter(
                models.ClassEnrollment.class_id == class_id,
                models.ClassEnrollment.student_id == student_id,
                models.ClassEnrollment.status == "active"
            ).first()
            if existing_enrollment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Student {student.full_name} is already enrolled in this class"
                )

            # Create enrollment
            enrollment = models.ClassEnrollment(
                student_id=student_id,
                class_id=class_id,
                status="active"
            )
            db.add(enrollment)
            enrollments.append(enrollment)

        # Update class student count
        class_.current_students = current_enrollments + len(student_ids)

        db.commit()
        for enrollment in enrollments:
            db.refresh(enrollment)

        return enrollments

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/classes/{class_id}/enrollments/{student_id}")
async def remove_student_from_class(
    class_id: int,
    student_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Remove a student from a class"""
    try:
        # Find the enrollment
        enrollment = db.query(models.ClassEnrollment).filter(
            models.ClassEnrollment.class_id == class_id,
            models.ClassEnrollment.student_id == student_id,
            models.ClassEnrollment.status == "active"
        ).first()

        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student is not enrolled in this class"
            )

        # Update enrollment status to 'dropped'
        enrollment.status = "dropped"

        # Update class student count
        class_ = db.query(models.Class).filter(models.Class.id == class_id).first()
        if class_:
            class_.current_students = max(0, class_.current_students - 1)

        db.commit()
        return {"message": "Student removed from class successfully"}

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/classes/{class_id}/enrollments", response_model=List[schemas.ClassEnrollment])
async def get_class_enrollments(
    class_id: int,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all enrollments for a class"""
    try:
        enrollments = db.query(models.ClassEnrollment).filter(
            models.ClassEnrollment.class_id == class_id
        ).all()
        return enrollments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 