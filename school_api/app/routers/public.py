from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from .. import models
from ..database import get_db

router = APIRouter(
    tags=["Public"],
    include_in_schema=True
)

class PublicUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    subject: str | None = None  # For teachers
    grade: str | None = None    # For students
    section: str | None = None  # For students

    class Config:
        orm_mode = True

@router.get(
    "/users", 
    response_model=List[PublicUserResponse],
    include_in_schema=True,
    responses={
        200: {"description": "List of all users"},
        500: {"description": "Internal server error"}
    }
)
def get_users(db: Session = Depends(get_db)):
    """Get all users with basic public information. No authentication required."""
    try:
        users = db.query(models.User).all()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get(
    "/users/role/{role}", 
    response_model=List[PublicUserResponse],
    include_in_schema=True,
    responses={
        200: {"description": "List of users with specified role"},
        404: {"description": "No users found with specified role"},
        500: {"description": "Internal server error"}
    }
)
def get_users_by_role(
    role: str, 
    db: Session = Depends(get_db)
):
    """
    Get users by role (teacher, student, parent, admin).
    No authentication required.
    
    Args:
        role: One of 'teacher', 'student', 'parent', 'admin'
    """
    try:
        # Validate role
        valid_roles = ['teacher', 'student', 'parent', 'admin']
        if role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
            
        users = db.query(models.User).filter(models.User.role == role).all()
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No users found with role: {role}"
            )
        return users
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 