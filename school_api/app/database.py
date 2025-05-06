from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get the directory containing this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Go up one level to get to the school_api directory
PROJECT_DIR = os.path.dirname(BASE_DIR)
# Database URL points to school.db in the project root
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(PROJECT_DIR, '..', 'school.db')}"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Only needed for SQLite
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 