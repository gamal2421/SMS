import requests
import pytest
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_student_login():
    """Test student login endpoint"""
    credentials = {
        "email": "emma@school.com",
        "password": "student123"  # Replace with actual test password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
    assert response.status_code == 200
    assert "access_token" in response.json()
    
def test_teacher_login():
    """Test teacher login endpoint"""
    credentials = {
        "email": "teacher@school.com",
        "password": "teacher123"  # Replace with actual test password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_invalid_login():
    """Test login with invalid credentials"""
    credentials = {
        "email": "wrong@email.com",
        "password": "wrongpass"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
    assert response.status_code == 401

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"]) 