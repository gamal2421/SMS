from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, Date, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String)  # teacher, student
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Fields for students
    grade = Column(String, nullable=True)
    section = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Fields for teachers
    subject = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    qualification = Column(String, nullable=True)

    # Relationships
    enrolled_classes = relationship("ClassEnrollment", back_populates="student")
    teaching_classes = relationship("Class", back_populates="teacher")
    
    # Parent-child relationship
    parent = relationship("User", remote_side=[id], backref="children", foreign_keys=[parent_id])

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    grade = Column(String)
    section = Column(String)
    subject = Column(String)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    capacity = Column(Integer)
    current_students = Column(Integer, default=0)
    schedule = Column(String)
    room = Column(String)
    status = Column(String, default="active")  # active, inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    teacher = relationship("User", back_populates="teaching_classes")
    enrolled_students = relationship("ClassEnrollment", back_populates="class_")

class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), index=True)
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="active")  # active, dropped, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("User", back_populates="enrolled_classes")
    class_ = relationship("Class", back_populates="enrolled_students") 

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    class_id = Column(Integer, ForeignKey("classes.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    due_date = Column(Date)
    max_score = Column(Float)
    status = Column(String, default="active")  # active, closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    class_ = relationship("Class")
    teacher = relationship("User")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")
    grades = relationship("Grade", back_populates="assignment")

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="submitted")  # submitted, graded, late
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User")
    grade = relationship("Grade", back_populates="submission", uselist=False)

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    date = Column(Date, index=True)
    status = Column(String)  # present, absent, late
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("User")
    class_ = relationship("Class")

class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=True)
    submission_id = Column(Integer, ForeignKey("assignment_submissions.id"), nullable=True)
    score = Column(Float)
    max_score = Column(Float, default=100.0)
    grade_type = Column(String, default="assignment")  # assignment, exam, quiz, etc.
    weight = Column(Float, default=1.0)
    rubric_data = Column(Text, nullable=True)
    comment = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, graded
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    class_ = relationship("Class")
    assignment = relationship("Assignment", back_populates="grades")
    submission = relationship("AssignmentSubmission", back_populates="grade", foreign_keys=[submission_id]) 