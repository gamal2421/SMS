from app.database import SessionLocal
from app.models import User

def check_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@school.com").first()
        if admin:
            print("Admin user exists:")
            print(f"Email: {admin.email}")
            print(f"Role: {admin.role}")
            print(f"Active: {admin.is_active}")
        else:
            print("No admin user found in database!")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin() 