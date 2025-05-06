from app.database import SessionLocal
from app.models import User
from app.routers.auth import get_password_hash

def add_test_users():
    db = SessionLocal()
    
    # Test users data
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
            "role": "teacher"
        },
        {
            "email": "student@school.com",
            "full_name": "Test Student",
            "password": "student123",
            "role": "student"
        },
        {
            "email": "parent@school.com",
            "full_name": "Test Parent",
            "password": "parent123",
            "role": "parent"
        }
    ]

    try:
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if existing_user:
                print(f"User {user_data['email']} already exists.")
                continue

            # Create new user
            db_user = User(
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                is_active=True
            )
            db.add(db_user)
            print(f"Created user: {user_data['email']}")
        
        db.commit()
        print("Test users added successfully!")
    
    except Exception as e:
        print(f"Error adding test users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_users() 