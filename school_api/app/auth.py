from fastapi import HTTPException, status, Depends
from passlib.context import CryptContext
from .models import User
from .dependencies import get_current_user
import logging

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against one provided by user"""
    return pwd_context.verify(plain_password, hashed_password)

async def get_current_teacher(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current authenticated teacher"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. User is not a teacher."
        )
    return current_user

async def get_current_student(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current authenticated student"""
    logger = logging.getLogger(__name__)
    logger.info(f"Checking if user {current_user.email} is a student")
    if current_user.role != "student":
        logger.error(f"User {current_user.email} is not a student (role: {current_user.role})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. User is not a student."
        )
    logger.info(f"Confirmed user {current_user.email} is a student")
    return current_user 