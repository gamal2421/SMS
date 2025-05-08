import pytest
import requests
import os
import sys
from datetime import datetime

# Add the project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Configuration
BASE_URL = "http://localhost:8000"
TEST_STUDENT_EMAIL = "emma@school.com"
TEST_STUDENT_PASSWORD = "student123"  # Replace with actual test password
TEST_TEACHER_EMAIL = "teacher@school.com"
TEST_TEACHER_PASSWORD = "teacher123"  # Replace with actual test password

@pytest.fixture(scope="session")
def base_url():
    """Return the base URL for the API"""
    return BASE_URL

@pytest.fixture(scope="session")
def student_credentials():
    """Return test student credentials"""
    return {
        "email": TEST_STUDENT_EMAIL,
        "password": TEST_STUDENT_PASSWORD
    }

@pytest.fixture(scope="session")
def teacher_credentials():
    """Return test teacher credentials"""
    return {
        "email": TEST_TEACHER_EMAIL,
        "password": TEST_TEACHER_PASSWORD
    }

@pytest.fixture(scope="session")
def student_token(base_url, student_credentials):
    """Get and cache student authentication token"""
    response = requests.post(f"{base_url}/auth/login", json=student_credentials)
    assert response.status_code == 200
    return response.json()["access_token"]

@pytest.fixture(scope="session")
def teacher_token(base_url, teacher_credentials):
    """Get and cache teacher authentication token"""
    response = requests.post(f"{base_url}/auth/login", json=teacher_credentials)
    assert response.status_code == 200
    return response.json()["access_token"]

@pytest.fixture
def student_headers(student_token):
    """Return headers for authenticated student requests"""
    return {"Authorization": f"Bearer {student_token}"}

@pytest.fixture
def teacher_headers(teacher_token):
    """Return headers for authenticated teacher requests"""
    return {"Authorization": f"Bearer {teacher_token}"}

@pytest.fixture
def test_file():
    """Create and return a test file for submissions"""
    file_path = "test_submission.txt"
    content = "Test submission content created at: " + datetime.now().isoformat()
    
    with open(file_path, "w") as f:
        f.write(content)
    
    yield file_path
    
    # Cleanup after test
    if os.path.exists(file_path):
        os.remove(file_path) 