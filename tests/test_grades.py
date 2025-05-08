import requests
import pytest
from datetime import datetime

BASE_URL = "http://localhost:8000"

class TestGrades:
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

    def test_get_student_grades(self, student_token):
        """Test getting student's grades"""
        headers = {"Authorization": f"Bearer {student_token}"}
        response = requests.get(f"{BASE_URL}/student/grades", headers=headers)
        assert response.status_code == 200
        grades = response.json()
        assert isinstance(grades, list)

    def test_teacher_grade_assignment(self, teacher_token):
        """Test teacher grading an assignment"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        
        # Get teacher's assignments
        response = requests.get(f"{BASE_URL}/teacher/assignments", headers=headers)
        assignments = response.json()
        
        if not assignments:
            pytest.skip("No assignments available for testing")
            
        # Get submissions for first assignment
        assignment_id = assignments[0]["id"]
        response = requests.get(
            f"{BASE_URL}/teacher/assignments/{assignment_id}/submissions",
            headers=headers
        )
        
        submissions = response.json()
        if not submissions:
            pytest.skip("No submissions available for testing")
            
        submission_id = submissions[0]["id"]
        
        # Grade submission
        grade_data = {
            "score": 85,
            "feedback": "Good work on the assignment!"
        }
        
        response = requests.post(
            f"{BASE_URL}/teacher/submissions/{submission_id}/grade",
            headers=headers,
            json=grade_data
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["score"] == grade_data["score"]
        assert result["feedback"] == grade_data["feedback"]

    def test_get_class_grades(self, teacher_token):
        """Test getting grades for an entire class"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        
        # Get teacher's classes
        response = requests.get(f"{BASE_URL}/teacher/classes", headers=headers)
        classes = response.json()
        
        if not classes:
            pytest.skip("No classes available for testing")
            
        class_id = classes[0]["id"]
        
        # Get class grades
        response = requests.get(
            f"{BASE_URL}/teacher/classes/{class_id}/grades",
            headers=headers
        )
        
        assert response.status_code == 200
        grades = response.json()
        assert isinstance(grades, list)

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"]) 