import os
import sys

# Add the school_api directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'school_api'))

from school_api.app.database import Base, engine
from school_api.app import models

def create_tables():
    print("Creating database tables...")
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables() 