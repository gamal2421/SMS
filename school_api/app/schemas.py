from datetime import datetime, date, timedelta
from typing import Optional, List, Dict
from pydantic import BaseModel, EmailStr, validator

class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    contact: Optional[str] = None
    is_active: Optional[bool] = True
    grade: Optional[str] = None
    section: Optional[str] = None
    subject: Optional[str] = None
    qualification: Optional[str] = None
    bio: Optional[str] = None
    parent_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    contact: Optional[str] = None
    is_active: Optional[bool] = None
    grade: Optional[str] = None
    section: Optional[str] = None
    subject: Optional[str] = None
    qualification: Optional[str] = None
    bio: Optional[str] = None
    parent_id: Optional[int] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    students: Optional[List['User']] = None

    class Config:
        from_attributes = True

# This is needed for the forward reference in User.students
User.update_forward_refs()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TeacherInfo(BaseModel):
    id: int
    email: str
    full_name: str
    subject: Optional[str] = None
    role: str = "teacher"
    created_at: datetime

    class Config:
        from_attributes = True

class EnrolledStudent(BaseModel):
    id: int
    email: str
    full_name: str
    role: str = "student"
    grade: Optional[str] = None
    section: Optional[str] = None

    class Config:
        from_attributes = True

class ClassBase(BaseModel):
    name: str
    grade: str
    section: str
    subject: str
    teacher_id: int
    capacity: int
    schedule: str
    room: str
    status: Optional[str] = "active"

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    section: Optional[str] = None
    subject: Optional[str] = None
    teacher_id: Optional[int] = None
    capacity: Optional[int] = None
    schedule: Optional[str] = None
    room: Optional[str] = None
    status: Optional[str] = None

class Class(ClassBase):
    id: int
    current_students: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    teacher: Optional[TeacherInfo] = None
    enrolled_students: Optional[List[EnrolledStudent]] = None

    class Config:
        from_attributes = True

# Class Enrollment schemas
class ClassEnrollmentBase(BaseModel):
    student_id: int
    class_id: int
    status: str = "active"  # active, dropped, completed

class ClassEnrollmentCreate(ClassEnrollmentBase):
    pass

class ClassEnrollment(ClassEnrollmentBase):
    id: int
    enrollment_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    student: Optional[User] = None
    class_: Optional[Class] = None

    class Config:
        from_attributes = True

# Assignment schemas
class AssignmentBase(BaseModel):
    title: str
    description: str
    class_id: int
    due_date: date
    max_score: float
    status: str = "active"  # active or closed

    @validator('due_date')
    def validate_due_date(cls, v):
        # If already a date, return it
        if isinstance(v, date):
            return v
            
        # Try to convert string to date with multiple formats
        if isinstance(v, str):
            formats_to_try = ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M']
            for fmt in formats_to_try:
                try:
                    return datetime.strptime(v, fmt).date()
                except ValueError:
                    continue
            
            # Try ISO format
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00')).date()
            except ValueError:
                pass
                
        # If all parsing fails, return today + 7 days
        return datetime.now().date() + timedelta(days=7)

    @validator('max_score')
    def validate_max_score(cls, v):
        if v <= 0:
            raise ValueError("Maximum score must be greater than 0")
        return v

    @validator('status')
    def validate_status(cls, v):
        if v.lower() not in ["active", "closed"]:
            raise ValueError("Status must be either 'active' or 'closed'")
        return v.lower()  # Convert to lowercase

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    max_score: Optional[float] = None
    status: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        if v not in ["Active", "Closed"]:
            raise ValueError("Status must be either 'Active' or 'Closed'")
        return v

    @validator('max_score')
    def validate_max_score(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Maximum score must be greater than 0")
        return v

class SubmissionStats(BaseModel):
    total_submissions: int
    graded_submissions: int
    pending_submissions: int

class Assignment(AssignmentBase):
    id: int
    teacher_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    submission_stats: Optional[SubmissionStats] = None

    class Config:
        from_attributes = True

class AssignmentSubmissionBase(BaseModel):
    assignment_id: int
    student_id: int
    content: str
    file_path: Optional[str] = None

class AssignmentSubmissionCreate(AssignmentSubmissionBase):
    pass

class AssignmentSubmissionUpdate(BaseModel):
    content: Optional[str] = None
    file_path: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    status: Optional[str] = None

class AssignmentSubmission(AssignmentSubmissionBase):
    id: int
    submission_date: datetime
    score: Optional[float] = None
    feedback: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Attendance schemas
class AttendanceBase(BaseModel):
    class_id: int
    student_id: int
    date: date
    status: str
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class Attendance(BaseModel):
    id: int
    class_id: int
    student_id: int
    student_name: Optional[str] = None
    date: date
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Grade schemas
class GradeBase(BaseModel):
    student_id: int
    class_id: int
    assignment_id: int
    score: Optional[float] = None
    max_score: float = 100.0
    grade_type: str = "assignment"
    weight: float = 1.0
    comment: Optional[str] = None
    status: str = "pending"

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    score: Optional[float] = None
    max_score: Optional[float] = None
    grade_type: Optional[str] = None
    weight: Optional[float] = None
    comment: Optional[str] = None
    status: Optional[str] = None

class GradeComment(BaseModel):
    student_id: int
    assignment_id: int
    comment: str

    class Config:
        from_attributes = True

class Grade(GradeBase):
    id: int
    student_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GradeStats(BaseModel):
    class_average: float
    highest_score: float
    lowest_score: float
    grade_distribution: Dict[str, int]  # A: 5, B: 10, etc.
    submission_status: Dict[str, int]  # pending: 5, graded: 15, etc.

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    text: str

class StudentPromotion(BaseModel):
    from_grade: str
    from_section: str
    to_grade: str
    to_section: str

    class Config:
        from_attributes = True

class Student(BaseModel):
    id: int
    email: str
    full_name: str
    grade: Optional[str] = None
    section: Optional[str] = None
    role: str = "student"
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GradeResponse(BaseModel):
    id: Optional[int] = None
    student_id: int
    student_name: str
    class_id: int
    assignment_id: Optional[int] = None
    score: Optional[float] = None
    max_score: float = 100.0
    grade_type: str = "assignment"
    weight: float = 1.0
    feedback: Optional[str] = None
    rubric_data: Optional[str] = None
    status: str = "pending"
    submission_status: Optional[str] = "not_submitted"
    submission_date: Optional[str] = None
    graded_date: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True 