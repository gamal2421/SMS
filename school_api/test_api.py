import os
import sys
from pathlib import Path
import requests
import json
from datetime import datetime

# Get the absolute path to the school-api directory
SCHOOL_API_DIR = str(Path(__file__).resolve().parent)
sys.path.append(SCHOOL_API_DIR)

# API configuration
API_URL = "http://localhost:8000"  # Update this if your API is running on a different port
TEACHER_EMAIL = "mr.roberts@school.com"  # Mr. Roberts' email
TEACHER_PASSWORD = "password123"  # Default password from seed data

def log_to_file(message):
    with open("api_test_log.txt", "a") as f:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{timestamp}] {message}\n")
        print(message)

def test_teacher_dashboard():
    try:
        # Step 1: Login to get the token
        log_to_file("Logging in as Mr. Roberts...")
        login_response = requests.post(
            f"{API_URL}/auth/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "username": TEACHER_EMAIL,
                "password": TEACHER_PASSWORD,
                "grant_type": "password"
            }
        )
        
        if login_response.status_code != 200:
            log_to_file(f"Login failed: {login_response.text}")
            return
        
        token = login_response.json()["access_token"]
        log_to_file("Successfully logged in and got token")
        
        # Step 2: Get dashboard stats
        log_to_file("\nGetting dashboard stats...")
        headers = {"Authorization": f"Bearer {token}"}
        stats_response = requests.get(
            f"{API_URL}/teacher/dashboard/stats",
            headers=headers
        )
        
        if stats_response.status_code != 200:
            log_to_file(f"Failed to get dashboard stats: {stats_response.text}")
            return
        
        stats = stats_response.json()
        log_to_file("\nDashboard Stats:")
        log_to_file(f"Total Students: {stats['total_students']}")
        log_to_file(f"Total Classes: {stats['total_classes']}")
        log_to_file(f"Active Assignments: {stats['active_assignments']}")
        log_to_file(f"Average Attendance: {stats['average_attendance']}%")
        
        # Step 3: Get teacher's classes
        log_to_file("\nGetting teacher's classes...")
        classes_response = requests.get(
            f"{API_URL}/teacher/classes",
            headers=headers
        )
        
        if classes_response.status_code != 200:
            log_to_file(f"Failed to get classes: {classes_response.text}")
            return
        
        classes = classes_response.json()
        log_to_file("\nClasses:")
        for class_ in classes:
            log_to_file(f"- {class_['name']} (ID: {class_['id']})")
            log_to_file(f"  Current Students: {class_['current_students']}")
            
            # Get students in this class
            students_response = requests.get(
                f"{API_URL}/teacher/classes/{class_['id']}/students",
                headers=headers
            )
            
            if students_response.status_code == 200:
                students = students_response.json()
                log_to_file(f"  Enrolled Students:")
                for student in students:
                    log_to_file(f"    - {student['full_name']} (ID: {student['id']})")
            else:
                log_to_file(f"  Failed to get students: {students_response.text}")
        
    except Exception as e:
        log_to_file(f"Error during API test: {e}")

if __name__ == "__main__":
    # Clear the log file
    with open("api_test_log.txt", "w") as f:
        f.write("")
    test_teacher_dashboard()