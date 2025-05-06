from app.database import SessionLocal, Base, engine
from app.models import User
from app.routers.auth import get_password_hash
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_and_init_db():
    logger.info("Verifying database setup...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if we have any users
        user_count = db.query(User).count()
        if user_count == 0:
            logger.info("No users found in database. Initializing with test users...")
            
            # Create test users
            test_users = [
                {
                    "email": "admin@school.com",
                    "full_name": "Admin User",
                    "password": "admin123",
                    "role": "admin"
                },
                {
                    "email": "teacher@school.com",
                    "full_name": "Test Teacher",
                    "password": "teacher123",
                    "role": "teacher",
                    "subject": "Mathematics",
                    "contact": "123-456-7890"
                },
                {
                    "email": "student@school.com",
                    "full_name": "Test Student",
                    "password": "student123",
                    "role": "student",
                    "grade": "10",
                    "section": "A",
                    "contact": "123-456-7891"
                },
                {
                    "email": "parent@school.com",
                    "full_name": "Test Parent",
                    "password": "parent123",
                    "role": "parent",
                    "contact": "123-456-7892"
                }
            ]
            
            for user_data in test_users:
                password = user_data.pop("password")
                db_user = User(
                    **user_data,
                    hashed_password=get_password_hash(password),
                    is_active=True
                )
                db.add(db_user)
                logger.info(f"Created user: {user_data['email']}")
            
            db.commit()
            logger.info("Test users created successfully!")
        else:
            logger.info(f"Database already contains {user_count} users.")
            
            # Verify test users exist
            test_emails = ["admin@school.com", "teacher@school.com", "student@school.com", "parent@school.com"]
            for email in test_emails:
                user = db.query(User).filter(User.email == email).first()
                if not user:
                    logger.warning(f"Warning: Test user {email} not found!")
                else:
                    logger.info(f"Verified test user: {email}")
    
    except Exception as e:
        logger.error(f"Error during database verification: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    verify_and_init_db() 