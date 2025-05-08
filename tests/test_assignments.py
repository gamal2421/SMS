import requests
import pytest
import os
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

class TestAssignments:
    @pytest.fixture
    def student_token(self):
        """Get student authentication token"""
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "emma@school.com",
            "password": "student123"  # Replace with actual test password
        })
        return response.json()["access_token"]

    @pytest.fixture
    def teacher_token(self):
        """Get teacher authentication token"""
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "teacher@school.com",
            "password": "teacher123"  # Replace with actual test password
        })
        return response.json()["access_token"]

    def test_get_student_assignments(self, student_token):
        """Test getting student's assignments"""
        headers = {"Authorization": f"Bearer {student_token}"}
        response = requests.get(f"{BASE_URL}/student/assignments", headers=headers)
        assert response.status_code == 200
        assignments = response.json()
        assert isinstance(assignments, list)

    def test_get_teacher_assignments(self, teacher_token):
        """Test getting teacher's assignments"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        response = requests.get(f"{BASE_URL}/teacher/assignments", headers=headers)
        assert response.status_code == 200
        assignments = response.json()
        assert isinstance(assignments, list)

    def test_submit_assignment(self, student_token):
        """Test submitting an assignment"""
        headers = {"Authorization": f"Bearer {student_token}"}
        
        # First get available assignments
        response = requests.get(f"{BASE_URL}/student/assignments", headers=headers)
        assignments = response.json()
        
        if not assignments:
            pytest.skip("No assignments available for testing")
        
        assignment_id = assignments[0]["id"]
        
        # Create test file
        test_file_path = "test_submission.txt"
        with open(test_file_path, "w") as f:
            f.write("Test submission content")
        
        # Submit assignment
        files = {
            "file": ("test.txt", open(test_file_path, "rb"), "text/plain")
        }
        data = {
            "notes": "Test submission notes"
        }
        
        response = requests.post(
            f"{BASE_URL}/student/assignments/{assignment_id}/submit",
            headers=headers,
            files=files,
            data=data
        )
        
        # Cleanup test file
        os.remove(test_file_path)
        
        assert response.status_code == 200
        result = response.json()
        assert "submission_id" in result

    def test_teacher_view_submissions(self, teacher_token):
        """Test teacher viewing assignment submissions"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        
        # Get teacher's assignments
        response = requests.get(f"{BASE_URL}/teacher/assignments", headers=headers)
        assignments = response.json()
        
        if not assignments:
            pytest.skip("No assignments available for testing")
        
        assignment_id = assignments[0]["id"]
        
        # Get submissions for the assignment
        response = requests.get(
            f"{BASE_URL}/teacher/assignments/{assignment_id}/submissions",
            headers=headers
        )
        
        assert response.status_code == 200
        submissions = response.json()
        assert isinstance(submissions, list)

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"]) 