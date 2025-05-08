from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from .models import User
from .database import get_db
from sqlalchemy.orm import Session
from .config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    logger.info("Attempting to get current user in dependencies")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logger.info(f"Decoding token in dependencies: {token[:10]}...")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.error("No email found in token")
            raise credentials_exception
        logger.info(f"Found email in token: {email}")
    except JWTError as e:
        logger.error(f"JWT Error in dependencies: {str(e)}")
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        logger.error(f"No user found for email: {email}")
        raise credentials_exception
    
    logger.info(f"Successfully found user in dependencies: {user.full_name}")
    return user 