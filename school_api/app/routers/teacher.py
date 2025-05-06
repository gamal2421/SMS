from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date, timedelta
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_teacher, get_password_hash
from ..config import settings
import logging
from sqlalchemy.sql import func, case
import os
from sqlalchemy import text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["teacher"])

def cors_response(data):
    """Helper function to add CORS headers to responses"""
    return JSONResponse(
        content=data,
        headers={
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",  # Specific origin for development
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type"
        }
    )

@router.options("/{path:path}")
async def options_handler(request: Request):
    """Handle OPTIONS requests for all teacher endpoints"""
    logger.info("Handling OPTIONS request")
    return cors_response({})

@router.get("/profile", response_model=schemas.User)
async def get_teacher_profile(
    request: Request,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get current teacher's profile"""
    # Get the teacher's first class subject if they don't have a subject set
    if not current_teacher.subject:
        first_class = db.query(models.Class).filter(
            models.Class.teacher_id == current_teacher.id,
            models.Class.status == "active"
        ).first()
        if first_class:
            current_teacher.subject = first_class.subject
            db.commit()
            db.refresh(current_teacher)
    
    # Return full teacher profile with all fields
    return cors_response({
        "id": current_teacher.id,
        "email": current_teacher.email,
        "full_name": current_teacher.full_name,
        "role": current_teacher.role,
        "is_active": current_teacher.is_active,
        "subject": current_teacher.subject,
        "contact": current_teacher.contact,
        "qualification": current_teacher.qualification,
        "bio": current_teacher.bio,
        "created_at": current_teacher.created_at.isoformat() if current_teacher.created_at else None,
        "updated_at": current_teacher.updated_at.isoformat() if current_teacher.updated_at else None
    })

@router.put("/profile", response_model=schemas.User)
async def update_teacher_profile(
    request: Request,
    profile_update: schemas.UserUpdate,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update teacher's profile"""
    try:
        # Update teacher fields
        for field, value in profile_update.dict(exclude_unset=True).items():
            if field == "password":
                setattr(current_teacher, "hashed_password", get_password_hash(value))
            else:
                setattr(current_teacher, field, value)
        
        current_teacher.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(current_teacher)

        # Return serialized response
        return cors_response({
            "id": current_teacher.id,
            "email": current_teacher.email,
            "full_name": current_teacher.full_name,
            "role": current_teacher.role,
            "is_active": current_teacher.is_active,
            "subject": current_teacher.subject,
            "contact": current_teacher.contact,
            "qualification": current_teacher.qualification,
            "bio": current_teacher.bio,
            "created_at": current_teacher.created_at.isoformat() if current_teacher.created_at else None,
            "updated_at": current_teacher.updated_at.isoformat() if current_teacher.updated_at else None
        })
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/classes", response_model=List[schemas.Class])
async def get_teacher_classes(
    request: Request,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get all classes assigned to the teacher"""
    try:
        logger.info(f"Getting classes for teacher: {current_teacher.email} (ID: {current_teacher.id})")
        
        # Query classes with related data
        classes = db.query(models.Class).filter(
            models.Class.teacher_id == current_teacher.id,
            models.Class.status == "active"  # Only show active classes
        ).options(
            joinedload(models.Class.enrolled_students)  # Load enrollments efficiently
        ).all()
        
        if not classes:
            return cors_response([])  # Return empty list instead of 404
        
        # Serialize the classes with detailed information
        serialized_classes = []
        for class_ in classes:
            # Get active enrollments
            active_enrollments = [
                e for e in class_.enrolled_students 
                if e.status == "active"
            ]
            
            # Get recent assignments
            recent_assignments = db.query(models.Assignment).filter(
                models.Assignment.class_id == class_.id,
                models.Assignment.status == "Active"
            ).order_by(
                models.Assignment.due_date.desc()
            ).limit(5).all()
            
            # Format assignments with proper date serialization
            assignment_list = [{
                "id": a.id,
                "title": a.title,
                "due_date": a.due_date.isoformat() if a.due_date else None,
                "status": a.status
            } for a in recent_assignments]
            
            # Format dates for class
            serialized_class = {
                "id": class_.id,
                "name": class_.name,
                "grade": class_.grade,
                "section": class_.section,
                "schedule": class_.schedule,
                "room": class_.room,
                "teacher_id": class_.teacher_id,
                "current_students": len(active_enrollments),
                "capacity": class_.capacity,
                "subject": class_.subject,
                "status": class_.status,
                "recent_assignments": assignment_list,
                "students_count": len(active_enrollments),
                "created_at": class_.created_at.isoformat() if class_.created_at else None,
                "updated_at": class_.updated_at.isoformat() if class_.updated_at else None
            }
            serialized_classes.append(serialized_class)
        
        logger.info(f"Found {len(serialized_classes)} classes")
        return cors_response(serialized_classes)
        
    except Exception as e:
        logger.error(f"Error getting classes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving classes: {str(e)}"
        )

@router.get("/classes/{class_id}", response_model=schemas.Class)
async def get_teacher_class(
    request: Request,
    class_id: int,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get specific class details"""
    try:
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )
        
        # Properly serialize the class object
        serialized_class = {
            "id": class_.id,
            "name": class_.name,
            "grade": class_.grade,
            "section": class_.section,
            "schedule": class_.schedule,
            "room": class_.room,
            "teacher_id": class_.teacher_id,
            "current_students": class_.current_students,
            "capacity": class_.capacity,
            "subject": class_.subject,
            "status": class_.status
        }
        
        return cors_response(serialized_class)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error getting class details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    request: Request,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the teacher"""
    try:
        logger.info(f"Getting dashboard stats for teacher: {current_teacher.email}")
        
        # Get total number of students across all active classes
        total_students = db.query(models.ClassEnrollment).join(
            models.Class,
            models.ClassEnrollment.class_id == models.Class.id
        ).filter(
            models.Class.teacher_id == current_teacher.id,
            models.Class.status.ilike("active"),
            models.ClassEnrollment.status.ilike("active")
        ).count()
        logger.info(f"Found {total_students} total students")

        # Get total number of active classes
        total_classes = db.query(models.Class).filter(
            models.Class.teacher_id == current_teacher.id,
            models.Class.status.ilike("active")
        ).count()
        logger.info(f"Found {total_classes} active classes")

        # Get total number of active assignments
        active_assignments = db.query(models.Assignment).filter(
            models.Assignment.teacher_id == current_teacher.id,
            models.Assignment.status.ilike("active")
        ).count()
        logger.info(f"Found {active_assignments} active assignments")

        # Calculate average attendance for the last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        attendance_stats = db.query(
            func.count(models.Attendance.id).label('total'),
            func.sum(
                case(
                    (models.Attendance.status.ilike("present"), 1),
                else_=0
                )
            ).label('present')
        ).join(
            models.Class,
            models.Attendance.class_id == models.Class.id
        ).filter(
            models.Class.teacher_id == current_teacher.id,
            models.Attendance.date >= thirty_days_ago
        ).first()

        average_attendance = 0
        if attendance_stats and attendance_stats.total and attendance_stats.total > 0 and attendance_stats.present is not None:
            average_attendance = round((attendance_stats.present / attendance_stats.total) * 100, 1)
        logger.info(f"Average attendance: {average_attendance}%")

        # Get recent submission statistics
        recent_submissions = db.query(models.AssignmentSubmission).join(
            models.Assignment,
            models.AssignmentSubmission.assignment_id == models.Assignment.id
        ).filter(
            models.Assignment.teacher_id == current_teacher.id,
            models.AssignmentSubmission.submission_date >= thirty_days_ago
        ).count()
        logger.info(f"Found {recent_submissions} recent submissions")

        # Get grade statistics
        grade_stats = db.query(
            func.avg(models.Grade.score).label('avg_score'),
            func.count(models.Grade.id).label('total_grades')
        ).join(
            models.Class,
            models.Grade.class_id == models.Class.id
        ).filter(
            models.Class.teacher_id == current_teacher.id,
            models.Grade.score.isnot(None)
        ).first()

        average_grade = round(grade_stats.avg_score, 1) if grade_stats and grade_stats.avg_score else 0
        total_grades = grade_stats.total_grades if grade_stats and grade_stats.total_grades else 0
        logger.info(f"Average grade: {average_grade}, Total grades: {total_grades}")

        response_data = {
            "total_students": total_students,
            "total_classes": total_classes,
            "active_assignments": active_assignments,
            "average_attendance": average_attendance,
            "recent_submissions": recent_submissions,
            "average_grade": average_grade,
            "total_grades": total_grades,
            "last_updated": datetime.now().isoformat()
        }
        logger.info("Successfully compiled dashboard stats")
        return cors_response(response_data)

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        return cors_response({
            "total_students": 0,
            "total_classes": 0,
            "active_assignments": 0,
            "average_attendance": 0,
            "recent_submissions": 0,
            "average_grade": 0,
            "total_grades": 0,
            "last_updated": datetime.now().isoformat(),
            "error": str(e)
        })

@router.get("/activities")
async def get_recent_activities(
    request: Request,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get recent activities for the teacher"""
    try:
        logger.info(f"Getting recent activities for teacher: {current_teacher.email}")
        activities = []

        # Get recent submissions
        logger.info("Querying recent submissions...")
        recent_submissions = db.query(
            models.AssignmentSubmission,
            models.Assignment,
            models.Class,
            models.User
        ).join(
            models.Assignment,
            models.AssignmentSubmission.assignment_id == models.Assignment.id
        ).join(
            models.Class,
            models.Assignment.class_id == models.Class.id
        ).join(
            models.User,
            models.AssignmentSubmission.student_id == models.User.id
        ).filter(
            models.Class.teacher_id == current_teacher.id
        ).order_by(
            models.AssignmentSubmission.submission_date.desc()
        ).limit(5).all()
        logger.info(f"Found {len(recent_submissions)} recent submissions")

        for submission, assignment, class_, student in recent_submissions:
            activities.append({
                "type": "submission",
                "title": f"{student.full_name} submitted {assignment.title}",
                "timestamp": submission.submission_date.isoformat()
            })

        # Get recent attendance records
        logger.info("Querying recent attendance records...")
        recent_attendance = db.query(
            models.Attendance,
            models.Class,
            models.User
        ).join(
            models.Class,
            models.Attendance.class_id == models.Class.id
        ).join(
            models.User,
            models.Attendance.student_id == models.User.id
        ).filter(
            models.Class.teacher_id == current_teacher.id
        ).order_by(
            models.Attendance.date.desc()
        ).limit(5).all()
        logger.info(f"Found {len(recent_attendance)} recent attendance records")

        for attendance, class_, student in recent_attendance:
            activities.append({
                "type": "attendance",
                "title": f"Marked {student.full_name} as {attendance.status} in {class_.name}",
                "timestamp": attendance.date.isoformat()
            })

        # Get recent grades
        try:
            logger.info("Querying recent grades...")
            recent_grades = db.query(
                models.Grade,
                models.Assignment,
                models.Class,
                models.User
            ).join(
                models.Assignment,
                models.Grade.assignment_id == models.Assignment.id
            ).join(
                models.Class,
                models.Grade.class_id == models.Class.id
            ).join(
                models.User,
                models.Grade.student_id == models.User.id
            ).filter(
                models.Class.teacher_id == current_teacher.id
            ).order_by(
                models.Grade.updated_at.desc()  # Use updated_at instead of graded_date
            ).limit(5).all()
            logger.info(f"Found {len(recent_grades)} recent grades")

            for grade, assignment, class_, student in recent_grades:
                activities.append({
                    "type": "grade",
                    "title": f"Graded {student.full_name}'s {assignment.title}",
                    "timestamp": grade.updated_at.isoformat() if grade.updated_at else grade.created_at.isoformat()
                })
        except Exception as e:
            logger.warning(f"Error processing recent grades: {str(e)}")
            # Continue without grades data

        # Sort all activities by timestamp and take the 10 most recent
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        logger.info(f"Returning {len(activities[:10])} total activities")
        return cors_response(activities[:10])

    except Exception as e:
        logger.error(f"Error getting recent activities: {str(e)}")
        return cors_response([])  # Return empty list instead of raising error

@router.get("/schedule")
async def get_teacher_schedule(
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get teacher's weekly schedule"""
    try:
        classes = db.query(models.Class).filter(
            models.Class.teacher_id == current_teacher.id
        ).all()
        
        # Transform classes into schedule format
        schedule = []
        for class_ in classes:
            schedule_parts = class_.schedule.split(", ")
            days = schedule_parts[0].split(", ")
            time = schedule_parts[1]
            
            for day in days:
                schedule.append({
                    "day": day,
                    "time": time,
                    "class_name": class_.name,
                    "room": class_.room,
                    "grade": class_.grade,
                    "section": class_.section
                })
        
        return schedule
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/assignments", response_model=List[schemas.Assignment])
async def get_teacher_assignments(
    request: Request,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get all assignments created by the teacher"""
    try:
        logger.info(f"Getting assignments for teacher: {current_teacher.email}")
        
        # Query assignments
        assignments = db.query(models.Assignment).filter(
            models.Assignment.teacher_id == current_teacher.id
        ).order_by(
            models.Assignment.due_date.desc()
        ).all()
        
        logger.info(f"Found {len(assignments)} assignments")
        
        # Serialize assignments with submission stats
        serialized_assignments = []
        for assignment in assignments:
            try:
                # Get class details
                class_ = db.query(models.Class).filter(models.Class.id == assignment.class_id).first()
                
                # Get submissions for this assignment
                submissions = db.query(models.AssignmentSubmission).filter(
                    models.AssignmentSubmission.assignment_id == assignment.id
                ).all()
                
                # Get grades for this assignment - handle missing columns
                grades = []
                try:
                    grades = db.query(models.Grade).filter(
                        models.Grade.assignment_id == assignment.id
                    ).all()
                except Exception as grade_error:
                    logger.warning(f"Error fetching grades for assignment {assignment.id}: {grade_error}")
                    # Continue without grades data
                
                # Calculate submission statistics
                total_submissions = len(submissions)
                graded_submissions = len(grades)
                
                # Check if assignment is overdue
                current_status = assignment.status if assignment.status else "active"
                if current_status.lower() == "active" and assignment.due_date and assignment.due_date < date.today():
                    status = "Overdue"
                else:
                    status = current_status
                
                # Create serialized assignment with safe defaults for null values
                serialized_assignment = {
                    "id": assignment.id,
                    "title": assignment.title or "Untitled Assignment",
                    "description": assignment.description or "",
                    "class_id": assignment.class_id,
                    "class_name": class_.name if class_ else "Unknown Class",
                    "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
                    "max_score": assignment.max_score or 100.0,
                    "status": status,
                    "teacher_id": assignment.teacher_id,
                    "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
                    "updated_at": assignment.updated_at.isoformat() if assignment.updated_at else None,
                    "submission_stats": {
                        "total_submissions": total_submissions,
                        "graded_submissions": graded_submissions,
                        "pending_submissions": total_submissions - graded_submissions
                    },
                    "total_students": class_.current_students if class_ and hasattr(class_, 'current_students') else 0
                }
                serialized_assignments.append(serialized_assignment)
            except Exception as e:
                # Log and continue if there's an error with one assignment
                logger.error(f"Error processing assignment {assignment.id}: {str(e)}")
                continue
        
        return cors_response(serialized_assignments)
    except Exception as e:
        logger.error(f"Error getting assignments: {str(e)}")
        # Return empty list instead of raising exception
        return cors_response([])

@router.get("/classes/{class_id}/assignments", response_model=List[schemas.Assignment])
async def get_class_assignments(
    class_id: int,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get assignments for a specific class"""
    try:
        # Verify class belongs to teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )
        
        # Get assignments for the class
        assignments = db.query(models.Assignment).filter(
            models.Assignment.class_id == class_id
        ).all()
        
        return assignments
    except Exception as e:
        logger.error(f"Error getting class assignments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting class assignments: {str(e)}"
        )

@router.post("/assignments", response_model=schemas.Assignment)
async def create_assignment(
    request: Request,
    assignment: schemas.AssignmentCreate,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Create a new assignment"""
    try:
        logger.info(f"Creating new assignment for teacher: {current_teacher.email}")
        logger.info(f"Assignment data: {assignment.dict()}")
        
        # Verify class belongs to teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == assignment.class_id,
            models.Class.teacher_id == current_teacher.id,
            models.Class.status == "active"  # Only allow assignments for active classes
        ).first()
        
        if not class_:
            logger.warning(f"Class {assignment.class_id} not found or not assigned to teacher {current_teacher.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found, not assigned to you, or inactive"
            )
            
        logger.info(f"Verified class: {class_.name} (ID: {class_.id})")
        
        # Create assignment with safe defaults if values are missing
        assignment_data = assignment.dict()
        
        # Ensure required fields have defaults if not provided
        if not assignment_data.get('max_score'):
            assignment_data['max_score'] = 100.0
            
        if not assignment_data.get('status'):
            assignment_data['status'] = 'active'
            
        # Ensure the due_date is in the correct format
        try:
            # If due_date is a string, convert it to date
            if isinstance(assignment_data.get('due_date'), str):
                due_date_str = assignment_data.get('due_date')
                # Handle various date formats
                try:
                    # Try ISO format
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).date()
                except ValueError:
                    try:
                        # Try YYYY-MM-DD format
                        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
                    except ValueError:
                        # Default to today + 7 days if parsing fails
                        logger.warning(f"Could not parse due_date: {due_date_str}, using default")
                        due_date = (datetime.now() + timedelta(days=7)).date()
                assignment_data['due_date'] = due_date
        except Exception as e:
            logger.error(f"Error parsing due date: {str(e)}")
            # Set a default due date if parsing fails
            assignment_data['due_date'] = (datetime.now() + timedelta(days=7)).date()
            
        # Create new assignment
        new_assignment = models.Assignment(
            **assignment_data,
            teacher_id=current_teacher.id,
            created_at=datetime.utcnow()
        )
        
        logger.info(f"Adding assignment to database: {new_assignment.title}")
        db.add(new_assignment)
        db.commit()
        db.refresh(new_assignment)
        logger.info(f"Assignment created successfully with ID: {new_assignment.id}")
        
        # Return serialized assignment
        return cors_response({
            "id": new_assignment.id,
            "title": new_assignment.title,
            "description": new_assignment.description,
            "class_id": new_assignment.class_id,
            "due_date": new_assignment.due_date.isoformat() if new_assignment.due_date else None,
            "max_score": new_assignment.max_score,
            "status": new_assignment.status,
            "teacher_id": new_assignment.teacher_id,
            "created_at": new_assignment.created_at.isoformat() if new_assignment.created_at else None,
            "updated_at": new_assignment.updated_at.isoformat() if new_assignment.updated_at else None,
            "submission_stats": {
                "total_submissions": 0,
                "graded_submissions": 0,
                "pending_submissions": 0
            }
        })
    except ValueError as ve:
        logger.error(f"Validation error creating assignment: {str(ve)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(ve)}"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error creating assignment: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating assignment: {str(e)}"
        )

@router.get("/assignments/{assignment_id}", response_model=schemas.Assignment)
async def get_assignment_details(
    request: Request,
    assignment_id: int,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get specific assignment details with submission statistics"""
    try:
        from fastapi import status  # Ensure status is properly imported
        
        # Get assignment
        assignment = db.query(models.Assignment).filter(
            models.Assignment.id == assignment_id,
            models.Assignment.teacher_id == current_teacher.id
        ).first()
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found"
            )
        
        # Get class details
        class_ = db.query(models.Class).filter(models.Class.id == assignment.class_id).first()
        
        # Get submissions for this assignment
        submissions_query = db.query(
            models.AssignmentSubmission, 
            models.User.full_name.label('student_name')
        ).join(
            models.User, 
            models.User.id == models.AssignmentSubmission.student_id
        ).filter(
            models.AssignmentSubmission.assignment_id == assignment.id
        ).all()
        
        # Get grades for this assignment
        grades = []
        try:
            grades = db.query(models.Grade).filter(
                models.Grade.assignment_id == assignment.id
            ).all()
        except Exception as e:
            logger.warning(f"Error fetching grades for assignment {assignment.id}: {e}")
        
        # Calculate submission statistics
        total_submissions = len(submissions_query)
        graded_submissions = len(grades)
        
        # Check if assignment is overdue
        current_status = assignment.status if assignment.status else "active"
        if current_status.lower() == "active" and assignment.due_date and assignment.due_date < date.today():
            status_value = "Overdue"
        else:
            status_value = current_status
        
        # Serialize submissions
        submissions = []
        for submission, student_name in submissions_query:
            # Get grade for this submission if it exists
            submission_grade = None
            for grade in grades:
                if hasattr(grade, 'submission_id') and grade.submission_id == submission.id:
                    submission_grade = grade
                    break
            
            score = submission_grade.score if submission_grade else None
            
            submissions.append({
                "id": submission.id,
                "student_id": submission.student_id,
                "student_name": student_name,
                "submission_date": submission.submission_date.isoformat() if submission.submission_date else None,
                "score": score,
                "feedback": submission.feedback,
                "status": submission.status
            })
        
        return cors_response({
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "class_id": assignment.class_id,
            "class_name": class_.name if class_ else "Unknown Class",
            "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
            "max_score": assignment.max_score,
            "status": status_value,
            "teacher_id": assignment.teacher_id,
            "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
            "updated_at": assignment.updated_at.isoformat() if assignment.updated_at else None,
            "submission_stats": {
                "total_submissions": total_submissions,
                "graded_submissions": graded_submissions,
                "pending_submissions": total_submissions - graded_submissions
            },
            "total_students": class_.current_students if class_ else 0,
            "submissions": submissions
        })
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error getting assignment details: {str(e)}")
        from fastapi import status  # Import status here as well for safety
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving assignment details: {str(e)}"
        )

@router.put("/assignments/{assignment_id}", response_model=schemas.Assignment)
async def update_assignment(
    request: Request,
    assignment_id: int,
    assignment_update: schemas.AssignmentUpdate,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update an existing assignment"""
    try:
        # Get assignment
        assignment = db.query(models.Assignment).filter(
            models.Assignment.id == assignment_id,
            models.Assignment.teacher_id == current_teacher.id
        ).first()
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found"
            )
        
        # Update fields
        update_data = assignment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(assignment, field, value)
        
        assignment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(assignment)
        
        # Return updated assignment
        return cors_response({
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "class_id": assignment.class_id,
            "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
            "max_score": assignment.max_score,
            "status": assignment.status,
            "teacher_id": assignment.teacher_id,
            "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
            "updated_at": assignment.updated_at.isoformat() if assignment.updated_at else None
        })
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error updating assignment: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating assignment: {str(e)}"
        )

@router.delete("/assignments/{assignment_id}")
async def delete_assignment(
    request: Request,
    assignment_id: int,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Delete an assignment"""
    try:
        from fastapi import status  # Import status here to avoid the unbound error
        
        # Get assignment
        assignment = db.query(models.Assignment).filter(
            models.Assignment.id == assignment_id,
            models.Assignment.teacher_id == current_teacher.id
        ).first()
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found"
            )
        
        # First, try to delete any related grades safely
        try:
            # Direct SQL to avoid ORM model issues with missing columns
            db.execute(f"DELETE FROM grades WHERE assignment_id = {assignment_id}")
        except Exception as grade_error:
            logger.warning(f"Error deleting grades for assignment {assignment_id}: {grade_error}")
            # Continue with deletion even if grade deletion fails
        
        # Next, try to delete submissions
        try:
            submissions = db.query(models.AssignmentSubmission).filter(
                models.AssignmentSubmission.assignment_id == assignment_id
            ).all()
            
            for submission in submissions:
                db.delete(submission)
        except Exception as sub_error:
            logger.warning(f"Error deleting submissions for assignment {assignment_id}: {sub_error}")
        
        # Finally, delete the assignment
        db.delete(assignment)
        db.commit()
        return cors_response({"message": "Assignment deleted successfully"})
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error deleting assignment: {str(e)}")
        db.rollback()
        from fastapi import status  # Import status here as well
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting assignment: {str(e)}"
        )

@router.get("/classes/{class_id}/attendance", response_model=List[schemas.Attendance])
async def get_class_attendance(
    class_id: int,
    date: Optional[date] = None,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get attendance records for a class"""
    try:
        # Verify the class belongs to the teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )
        
        if not date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Date parameter is required"
            )

        # Get all enrolled students
        enrolled_students = db.query(models.User).join(
            models.ClassEnrollment,
            models.User.id == models.ClassEnrollment.student_id
        ).filter(
            models.ClassEnrollment.class_id == class_id,
            models.ClassEnrollment.status == "active"
        ).all()

        # Get existing attendance records for the date
        existing_records = db.query(models.Attendance).filter(
            models.Attendance.class_id == class_id,
            models.Attendance.date == date
        ).all()

        # Create a map of existing records by student_id
        existing_records_map = {record.student_id: record for record in existing_records}

        # Create or get attendance records for all enrolled students
        attendance_records = []
        for student in enrolled_students:
            if student.id in existing_records_map:
                # Use existing record
                record = existing_records_map[student.id]
            else:
                # Create new record
                record = models.Attendance(
                    class_id=class_id,
                    student_id=student.id,
                    date=date,
                    status="absent",  # Default status
                    notes=""
                )
                db.add(record)  # Add the record to the session
                db.flush()  # Get the ID without committing

            attendance_dict = {
                "id": record.id,
                "class_id": record.class_id,
                "student_id": record.student_id,
                "student_name": student.full_name,
                "date": record.date.isoformat() if record.date else None,
                "status": record.status,
                "notes": record.notes
            }
            attendance_records.append(attendance_dict)

        # Commit any new records
        db.commit()
        
        # Sort records by student name
        attendance_records.sort(key=lambda x: x["student_name"])
        
        return cors_response(attendance_records)
        
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Error getting attendance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/classes/{class_id}/attendance", response_model=List[schemas.Attendance])
async def mark_class_attendance(
    class_id: int,
    attendance_records: List[schemas.AttendanceCreate],
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Mark attendance for multiple students"""
    try:
        # Verify class belongs to teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )
        
        # Create attendance records
        db_records = []
        for record in attendance_records:
            db_record = models.Attendance(**record.dict())
            db.add(db_record)
            db_records.append(db_record)
        
        db.commit()
        for record in db_records:
            db.refresh(record)
        
        return db_records
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/attendance/{attendance_id}", response_model=schemas.Attendance)
async def update_attendance(
    attendance_id: int,
    attendance_update: schemas.AttendanceUpdate,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update an attendance record"""
    try:
        # Get attendance record
        attendance = db.query(models.Attendance).join(
            models.Class, models.Class.id == models.Attendance.class_id
        ).filter(
            models.Attendance.id == attendance_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        
        if not attendance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record not found"
            )
        
        # Update fields
        for field, value in attendance_update.dict(exclude_unset=True).items():
            setattr(attendance, field, value)
        
        db.commit()
        db.refresh(attendance)
        return attendance
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/classes/{class_id}/grades", response_model=List[schemas.GradeResponse])
async def get_class_grades(
    class_id: int,
    assignment_id: Optional[int] = None,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get grades for a class"""
    try:
        logger.info(f"Getting grades for class {class_id} and assignment {assignment_id}")
        
        # Verify class belongs to teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        
        if not class_:
            logger.warning(f"Class {class_id} not found or not assigned to teacher {current_teacher.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )
        
        logger.info(f"Found class: {class_.name}")
        
        # If assignment_id is provided, verify it exists and belongs to this class
        if assignment_id:
            logger.info(f"Verifying assignment {assignment_id}")
            assignment = db.query(models.Assignment).filter(
                models.Assignment.id == assignment_id,
                models.Assignment.class_id == class_id
            ).first()
            
            if not assignment:
                logger.warning(f"Assignment {assignment_id} not found for class {class_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assignment not found or not associated with this class"
                )
            
            logger.info(f"Found assignment: {assignment.title}")
        
        # Get all enrolled students in the class
        logger.info(f"Getting enrolled students for class {class_id}")
        enrolled_students = db.query(models.User).join(
            models.ClassEnrollment,
            models.User.id == models.ClassEnrollment.student_id
        ).filter(
            models.ClassEnrollment.class_id == class_id,
            models.ClassEnrollment.status == "active"
        ).all()
        
        logger.info(f"Found {len(enrolled_students)} enrolled students")
        
        # Get existing grades and submissions for the assignment if specified
        grades_dict = {}
        submissions_dict = {}
        if assignment_id:
            try:
                # Get existing grades
                logger.info(f"Getting grades for assignment {assignment_id}")
                existing_grades = db.query(models.Grade).filter(
                    models.Grade.class_id == class_id,
                    models.Grade.assignment_id == assignment_id
                ).all()
                grades_dict = {grade.student_id: grade for grade in existing_grades}
                logger.info(f"Found {len(existing_grades)} existing grades")
                
                # Get submissions for this assignment
                logger.info(f"Getting submissions for assignment {assignment_id}")
                submissions = db.query(models.AssignmentSubmission).filter(
                    models.AssignmentSubmission.assignment_id == assignment_id
                ).all()
                submissions_dict = {sub.student_id: sub for sub in submissions}
                logger.info(f"Found {len(submissions)} submissions")
            except Exception as e:
                logger.error(f"Error getting grades/submissions: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error getting grades/submissions: {str(e)}"
                )
        
        # Format grades with student names, including students without grades
        formatted_grades = []
        for student in enrolled_students:
            grade = grades_dict.get(student.id)
            submission = submissions_dict.get(student.id)
            formatted_grade = {
                "id": getattr(grade, 'id', None),
                "student_id": student.id,
                "student_name": student.full_name,
                "class_id": class_id,
                "assignment_id": assignment_id,
                "score": getattr(grade, 'score', None),
                "max_score": getattr(grade, 'max_score', 100.0),
                "grade_type": getattr(grade, 'grade_type', "assignment"),
                "weight": getattr(grade, 'weight', 1.0),
                "feedback": getattr(grade, 'feedback', None),
                "rubric_data": getattr(grade, 'rubric_data', None),
                "status": getattr(grade, 'status', "pending"),
                "submission_status": getattr(submission, 'status', "not_submitted"),
                "submission_date": submission.submission_date.isoformat() if submission and hasattr(submission, 'submission_date') and submission.submission_date else None,
                "graded_date": grade.graded_date.isoformat() if grade and hasattr(grade, 'graded_date') and grade.graded_date else None,
                "created_at": grade.created_at.isoformat() if grade and hasattr(grade, 'created_at') and grade.created_at else None,
                "updated_at": grade.updated_at.isoformat() if grade and hasattr(grade, 'updated_at') and grade.updated_at else None
            }
            formatted_grades.append(formatted_grade)
        
        logger.info(f"Returning {len(formatted_grades)} formatted grades")
        return cors_response(formatted_grades)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error getting class grades: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting class grades: {str(e)}"
        )

@router.post("/classes/{class_id}/grades", response_model=schemas.Grade)
async def create_or_update_grade(
    class_id: int,
    grade_data: schemas.GradeCreate,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Create or update a grade"""
    try:
        # Verify class belongs to teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )
        
        # Check if grade exists
        grade = db.query(models.Grade).filter(
            models.Grade.class_id == class_id,
            models.Grade.assignment_id == grade_data.assignment_id,
            models.Grade.student_id == grade_data.student_id
        ).first()
        
        if grade:
            # Update existing grade
            for key, value in grade_data.dict(exclude_unset=True).items():
                setattr(grade, key, value)
        else:
            # Create new grade
            grade = models.Grade(**grade_data.dict())
            db.add(grade)
        
        db.commit()
        db.refresh(grade)
        return grade
    except Exception as e:
        logger.error(f"Error creating/updating grade: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating/updating grade: {str(e)}"
        )

@router.post("/classes/{class_id}/grades/comment", response_model=schemas.Grade)
async def add_grade_comment(
    class_id: int,
    comment_data: schemas.GradeComment,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Add a comment to a grade"""
    try:
        # Verify class belongs to teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )
        
        # Get grade
        grade = db.query(models.Grade).filter(
            models.Grade.class_id == class_id,
            models.Grade.assignment_id == comment_data.assignment_id,
            models.Grade.student_id == comment_data.student_id
        ).first()
        
        if not grade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grade not found"
            )
        
        # Update comment
        grade.comment = comment_data.comment
        db.commit()
        db.refresh(grade)
        return grade
    except Exception as e:
        logger.error(f"Error adding grade comment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding grade comment: {str(e)}"
        )

@router.get("/classes/{class_id}/students", response_model=List[schemas.EnrolledStudent])
async def get_class_students(
    class_id: int,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get students in a specific class"""
    try:
        # Verify class belongs to teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )
        
        # Get students enrolled in the class with active status
        students = db.query(models.User).join(
            models.ClassEnrollment,
            models.User.id == models.ClassEnrollment.student_id
        ).filter(
            models.ClassEnrollment.class_id == class_id,
            models.ClassEnrollment.status == "active",
            models.User.role == "student"
        ).all()
        
        # Format response according to EnrolledStudent schema
        formatted_students = []
        for student in students:
            formatted_students.append({
                "id": student.id,
                "email": student.email,
                "full_name": student.full_name,
                "role": student.role,
                "grade": student.grade,
                "section": student.section
            })
        
        return cors_response(formatted_students)
    except Exception as e:
        logger.error(f"Error getting class students: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting class students: {str(e)}"
        )

@router.get("/classes/{class_id}/stats")
async def get_class_stats(
    class_id: int,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get statistics for a specific class"""
    try:
        # Verify class belongs to teacher
        class_ = db.query(models.Class).filter(
            models.Class.id == class_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found or not assigned to you"
            )

        # Get assignment count for this class
        active_assignments = db.query(models.Assignment).filter(
            models.Assignment.class_id == class_id,
            models.Assignment.status.ilike("active")
        ).count()
        
        # Get completed assignment count
        completed_assignments = db.query(models.Assignment).filter(
            models.Assignment.class_id == class_id,
            models.Assignment.status.ilike("closed")
        ).count()
        
        # Get all grades for this class with safe error handling
        grades = []
        try:
            grades = db.query(models.Grade).filter(
                models.Grade.class_id == class_id,
                models.Grade.score.isnot(None)
            ).all()
        except Exception as e:
            logger.error(f"Error getting grades for class stats: {str(e)}")
        
        # Calculate average grade safely
        total_grade = 0
        try:
            for grade in grades:
                if hasattr(grade, 'score') and grade.score is not None:
                    total_grade += float(grade.score)
        except Exception as e:
            logger.error(f"Error calculating total grade: {str(e)}")
            
        graded_submissions_count = len(grades)
        average_grade = round(total_grade / graded_submissions_count, 1) if graded_submissions_count > 0 else 0.0

        # Get enrolled students count safely
        enrolled_students = 0
        try:
            enrolled_students = class_.current_students if hasattr(class_, 'current_students') and class_.current_students is not None else 0
        except Exception as e:
            logger.error(f"Error getting enrolled students count: {str(e)}")

        return cors_response({
            "active_assignments": active_assignments,
            "completed_assignments": completed_assignments,
            "average_grade": average_grade,
            "enrolled_students": enrolled_students
        })

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error getting class statistics: {str(e)}")
        # Return default values instead of raising exception
        return cors_response({
            "active_assignments": 0,
            "completed_assignments": 0,
            "average_grade": 0.0,
            "enrolled_students": 0,
            "error": str(e)
        })

@router.post("/grades/bulk", response_model=List[schemas.Grade])
async def create_bulk_grades(
    grades: List[schemas.GradeCreate],
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Create multiple grade entries at once"""
    try:
        # Verify all classes belong to teacher
        class_ids = set(grade.class_id for grade in grades)
        classes = db.query(models.Class).filter(
            models.Class.id.in_(class_ids),
            models.Class.teacher_id == current_teacher.id
        ).all()
        
        if len(classes) != len(class_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more classes not found or not assigned to you"
            )
        
        # Create grades
        db_grades = []
        for grade in grades:
            db_grade = models.Grade(**grade.dict())
            db.add(db_grade)
            db_grades.append(db_grade)
        
        db.commit()
        for grade in db_grades:
            db.refresh(grade)
        
        return db_grades
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating bulk grades: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/grades/{grade_id}/rubric", response_model=schemas.Grade)
async def update_grade_rubric(
    grade_id: int,
    rubric_data: str,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update rubric data for a grade"""
    try:
        # Get grade
        grade = db.query(models.Grade).join(
            models.Class, models.Class.id == models.Grade.class_id
        ).filter(
            models.Grade.id == grade_id,
            models.Class.teacher_id == current_teacher.id
        ).first()
        
        if not grade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grade not found"
            )
        
        # Update rubric data
        grade.rubric_data = rubric_data
        grade.updated_at = func.now()
        
        db.commit()
        db.refresh(grade)
        return grade
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating grade rubric: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/assignments/{assignment_id}/submissions", response_model=List[schemas.AssignmentSubmission])
async def get_assignment_submissions(
    request: Request,
    assignment_id: int,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get all submissions for a specific assignment"""
    try:
        from fastapi import status  # Import status to avoid the unbound error
        
        # Verify assignment belongs to teacher
        assignment = db.query(models.Assignment).filter(
            models.Assignment.id == assignment_id,
            models.Assignment.teacher_id == current_teacher.id
        ).first()
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found or not assigned to you"
            )
        
        # Get submissions with student information
        submissions = db.query(
            models.AssignmentSubmission,
            models.User.full_name.label('student_name')
        ).join(
            models.User,
            models.User.id == models.AssignmentSubmission.student_id
        ).filter(
            models.AssignmentSubmission.assignment_id == assignment_id
        ).all()
        
        # Get grades for this assignment with safe error handling
        grades = []
        try:
            # Try to get grades, but handle missing columns gracefully
            grades = db.query(models.Grade).filter(
                models.Grade.assignment_id == assignment_id
            ).all()
        except Exception as e:
            logger.error(f"Error getting assignment submissions: {str(e)}")
            # Continue without grades data
        
        # Serialize submissions
        serialized_submissions = []
        for submission, student_name in submissions:
            # Find matching grade for this submission if any
            submission_grade = None
            for grade in grades:
                # We can't rely on submission_id since it doesn't exist, so match by student_id
                if grade.student_id == submission.student_id:
                    submission_grade = grade
                    break
            
            # Build serialized submission
            serialized_submission = {
                "id": submission.id,
                "student_id": submission.student_id,
                "student_name": student_name,
                "assignment_id": submission.assignment_id,
                "submission_date": submission.submission_date.isoformat() if submission.submission_date else None,
                "status": submission.status,
                "score": submission_grade.score if submission_grade else None,
                "feedback": submission.feedback,
                "file_path": submission.file_path
            }
            serialized_submissions.append(serialized_submission)
        
        return cors_response(serialized_submissions)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error getting assignment submissions: {str(e)}")
        from fastapi import status  # Import status here as well
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving assignment submissions: {str(e)}"
        )

@router.get("/uploads/assignments/assignments/submissions/{file_path:path}")
async def download_submission_file(
    request: Request,
    file_path: str,
    current_teacher: models.User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Download a submitted assignment file"""
    try:
        # Clean the file path to prevent directory traversal
        clean_path = file_path.replace('..', '').replace('\\', '/').strip('/')
        
        # Construct the full file path
        full_path = os.path.join('uploads', 'assignments', 'assignments', 'submissions', clean_path)
        
        logger.info(f"Attempting to download file: {full_path}")
        
        if not os.path.exists(full_path):
            logger.error(f"File not found at path: {full_path}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found at path: {full_path}"
            )
            
        # Verify the file belongs to an assignment submission for this teacher
        submission = db.query(models.AssignmentSubmission).join(
            models.Assignment,
            models.AssignmentSubmission.assignment_id == models.Assignment.id
        ).filter(
            models.Assignment.teacher_id == current_teacher.id,
            models.AssignmentSubmission.file_path.endswith(clean_path)
        ).first()
        
        if not submission:
            logger.error(f"No submission found for file: {clean_path}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found or access denied"
            )
            
        logger.info(f"Serving file: {full_path}")
        return FileResponse(
            full_path,
            media_type='application/octet-stream',
            filename=os.path.basename(clean_path),
            headers={
                "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Content-Disposition": f"attachment; filename={os.path.basename(clean_path)}"
            }
        )
        
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file: {str(e)}"
        ) 