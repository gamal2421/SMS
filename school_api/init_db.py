from app.database import SessionLocal, Base, engine
from app.models import User
from app.routers.auth import get_password_hash
from sqlalchemy.exc import SQLAlchemyError

def init_db():
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except SQLAlchemyError as e:
        print(f"Error creating database tables: {e}")
        return

    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.email == "admin@school.com").first()
        if not admin:
            # Create admin user
            admin_user = User(
                email="admin@school.com",
                full_name="Admin User",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully!")
        else:
            print("Admin user already exists!")
    except SQLAlchemyError as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating initial data...")
    init_db()
    print("Initial data created!") 