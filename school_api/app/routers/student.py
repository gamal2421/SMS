from fastapi import APIRouter, Depends, HTTPException, status, Request, File, UploadFile, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_student
from fastapi.responses import JSONResponse, FileResponse
import logging
import os
import shutil
from ..config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads/assignments/assignments/submissions"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    tags=["Student"],
    responses={404: {"description": "Not found"}},
)

logger.info("Student router initialized")

def cors_response(data, request: Request = None):
    """Helper function to add CORS headers to responses"""
    origin = request.headers.get("origin", "http://127.0.0.1:5500") if request else "http://127.0.0.1:5500"
    return JSONResponse(
        content=data,
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@router.get("/test")
async def test_route():
    """Test route to verify the router is working"""
    return {"message": "Student router is working"}

@router.get("/profile")
async def get_student_profile(
    request: Request,
    current_student: models.User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Get current student's profile"""
    try:
        logger.info(f"Getting profile for student: {current_student.email}")
        logger.info(f"Request path: {request.url.path}")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        student = db.query(models.User).filter(
            models.User.id == current_student.id,
            models.User.role == "student"
        ).first()
        
        if not student:
            logger.error(f"Student not found: {current_student.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        logger.info(f"Successfully retrieved student profile: {student.full_name}")
        response_data = {
            "id": student.id,
            "email": student.email,
            "full_name": student.full_name,
            "role": student.role,
            "grade": student.grade,
            "section": student.section,
            "contact": student.contact,
            "is_active": student.is_active,
            "created_at": student.created_at.isoformat() if student.created_at else None,
            "updated_at": student.updated_at.isoformat() if student.updated_at else None
        }
        logger.info(f"Returning response data: {response_data}")
        
        # Return response with specific CORS headers for this endpoint
        return JSONResponse(
            content=response_data,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "http://127.0.0.1:5500"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type"
            }
        )
    except Exception as e:
        logger.error(f"Error getting student profile: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/profile")
async def options_student_profile(request: Request):
    """Handle OPTIONS request for the profile endpoint"""
    logger.info("Handling OPTIONS request for /profile endpoint")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "http://127.0.0.1:5500"),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        }
    )

@router.get("/classes", response_model=List[schemas.Class])
async def get_student_classes(
    current_student: models.User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Get all classes the student is enrolled in"""
    try:
        classes = db.query(models.Class).join(
            models.ClassEnrollment,
            models.Class.id == models.ClassEnrollment.class_id
        ).filter(
            models.ClassEnrollment.student_id == current_student.id,
            models.ClassEnrollment.status == "active"
        ).options(
            joinedload(models.Class.teacher)
        ).all()
        
        return classes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/assignments", response_model=List[schemas.Assignment])
async def get_student_assignments(
    current_student: models.User = Depends(get_current_student),
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all assignments for the student's enrolled classes"""
    try:
        # Build base query with class information
        query = db.query(models.Assignment, models.Class).join(
            models.ClassEnrollment,
            models.Assignment.class_id == models.ClassEnrollment.class_id
        ).join(
            models.Class,
            models.Assignment.class_id == models.Class.id
        ).filter(
            models.ClassEnrollment.student_id == current_student.id,
            models.ClassEnrollment.status == "active"
        )
        
        # Filter by status if provided
        if status_filter:
            query = query.filter(models.Assignment.status.ilike(f"%{status_filter}%"))
        
        # Get assignments
        results = query.order_by(models.Assignment.due_date).all()
        
        # Convert to dict for JSON response
        assignments_data = []
        for assignment, class_ in results:
            # Get submission status and grade for this assignment
            submission = db.query(models.AssignmentSubmission).filter(
                models.AssignmentSubmission.assignment_id == assignment.id,
                models.AssignmentSubmission.student_id == current_student.id
            ).first()

            # Determine assignment status and grade
            submission_status = "pending"
            grade = None
            feedback = None
            
            if submission:
                submission_status = getattr(submission, 'status', 'pending')
                grade = getattr(submission, 'grade', None)
                feedback = getattr(submission, 'feedback', None)

            assignments_data.append({
                "id": assignment.id,
                "title": assignment.title,
                "description": assignment.description,
                "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
                "status": submission_status,
                "grade": grade,
                "max_grade": getattr(assignment, 'max_grade', 100),  # Default max grade is 100
                "feedback": feedback,
                "class_id": assignment.class_id,
                "class_name": class_.name,
                "subject": class_.subject
            })
        
        return JSONResponse(
            content=assignments_data,
            headers={
                "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type"
            }
        )
    except Exception as e:
        logger.error(f"Error getting assignments: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/grades", response_model=List[schemas.Grade])
async def get_student_grades(
    current_student: models.User = Depends(get_current_student),
    class_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all grades for the student"""
    try:
        # Build base query with class information
        query = db.query(models.Grade, models.Class).join(
            models.Class,
            models.Grade.class_id == models.Class.id
        ).filter(
            models.Grade.student_id == current_student.id
        )
        
        # Filter by class if provided
        if class_id:
            query = query.filter(models.Grade.class_id == class_id)
        
        # Get grades
        results = query.order_by(models.Grade.created_at.desc()).all()
        
        # Convert to dict for JSON response
        grades_data = []
        for grade, class_ in results:
            grades_data.append({
                "id": grade.id,
                "score": grade.score,
                "max_score": grade.max_score,
                "class_id": grade.class_id,
                "subject": class_.name,
                "created_at": grade.created_at.isoformat() if grade.created_at else None
            })
        
        return JSONResponse(
            content=grades_data,
            headers={
                "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type"
            }
        )
    except Exception as e:
        logger.error(f"Error getting grades: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/attendance", response_model=List[schemas.Attendance])
async def get_student_attendance(
    current_student: models.User = Depends(get_current_student),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get student's attendance records"""
    try:
        # Build base query
        query = db.query(models.Attendance).filter(
            models.Attendance.student_id == current_student.id
        )
        
        # Apply filters
        if start_date:
            query = query.filter(models.Attendance.date >= start_date)
        if end_date:
            query = query.filter(models.Attendance.date <= end_date)
        if class_id:
            query = query.filter(models.Attendance.class_id == class_id)
        
        # Get attendance records
        attendance = query.order_by(models.Attendance.date.desc()).all()
        
        return attendance
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/schedule", response_model=List[schemas.Class])
async def get_student_schedule(
    current_student: models.User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Get student's class schedule"""
    try:
        schedule = db.query(models.Class).join(
            models.ClassEnrollment,
            models.Class.id == models.ClassEnrollment.class_id
        ).filter(
            models.ClassEnrollment.student_id == current_student.id,
            models.ClassEnrollment.status == "active"
        ).options(
            joinedload(models.Class.teacher)
        ).order_by(
            models.Class.schedule
        ).all()
        
        # Convert to dict for JSON response
        schedule_data = []
        for class_ in schedule:
            teacher_name = f"{class_.teacher.full_name}" if class_.teacher else "Not Assigned"
            
            # Parse schedule field (format: "Mon, Wed 09:00-10:30" or similar)
            days = []
            start_time = None
            end_time = None
            if class_.schedule:
                # Split into days and time parts
                parts = class_.schedule.split()
                if len(parts) >= 2:
                    # Handle days (could be "Mon, Wed" or similar)
                    day_part = ' '.join(parts[:-1])  # Everything except the last part
                    days = [d.strip().replace(',', '') for d in day_part.split()]
                    
                    # Handle time (format: "09:00-10:30")
                    time_part = parts[-1]
                    if '-' in time_part:
                        times = time_part.split('-')
                        if len(times) == 2:
                            start_time = times[0]
                            end_time = times[1]

            # Create an entry for each day
            for day in days:
                # Convert short day names to full names
                day_mapping = {
                    'Mon': 'Monday',
                    'Tue': 'Tuesday',
                    'Wed': 'Wednesday',
                    'Thu': 'Thursday',
                    'Fri': 'Friday'
                }
                full_day = day_mapping.get(day, day)
                
                schedule_data.append({
                    "id": class_.id,
                    "subject": class_.name,
                    "teacher_name": teacher_name,
                    "room": class_.room,
                    "day": full_day,
                    "start_time": start_time,
                    "end_time": end_time
                })
        
        return JSONResponse(
            content=schedule_data,
            headers={
                "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type"
            }
        )
    except Exception as e:
        logger.error(f"Error getting schedule: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    notes: str = Form(None),
    current_student: models.User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Submit an assignment with a file upload"""
    try:
        # Check if assignment exists and student is enrolled in the class
        assignment = db.query(models.Assignment).join(
            models.ClassEnrollment,
            models.Assignment.class_id == models.ClassEnrollment.class_id
        ).filter(
            models.Assignment.id == assignment_id,
            models.ClassEnrollment.student_id == current_student.id,
            models.ClassEnrollment.status == "active"
        ).first()

        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found or you're not enrolled in this class"
            )

        # Check if assignment is still active
        if assignment.status.lower() != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This assignment is no longer accepting submissions"
            )

        # Check if already submitted
        existing_submission = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment_id,
            models.AssignmentSubmission.student_id == current_student.id
        ).first()

        if existing_submission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already submitted this assignment"
            )

        # Save the uploaded file with a unique name
        file_name = f"{current_student.id}_{assignment_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Store the relative path in the database
        db_file_path = f"assignments/assignments/submissions/{file_name}"

        # Create submission record
        submission = models.AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=current_student.id,
            content=notes,
            file_path=db_file_path,
            status="Submitted",
            submission_date=datetime.utcnow()
        )

        db.add(submission)
        db.commit()
        db.refresh(submission)

        return JSONResponse(
            content={
                "message": "Assignment submitted successfully",
                "submission_id": submission.id,
                "submission_date": submission.submission_date.isoformat(),
                "file_name": file_name,
                "file_path": db_file_path
            },
            headers={
                "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type"
            }
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error submitting assignment: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 