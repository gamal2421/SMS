import unittest
import requests
import os

class TestFileRetrieval(unittest.TestCase):
    def setUp(self):
        self.base_url = "http://localhost:8000"
        self.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huc29uQHNjaG9vbC5jb20iLCJleHAiOjE3NDY0ODU2MTB9.i20BomExil4uDsSxnFhaHcfXsmgDk0t5XSRz-I8d7g8"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def test_get_assignments(self):
        """Test retrieving assignments"""
        response = requests.get(
            f"{self.base_url}/teacher/assignments",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        assignments = response.json()
        self.assertIsInstance(assignments, list)
        print(f"\nFound {len(assignments)} assignments")
        return assignments

    def test_get_submissions(self):
        """Test retrieving submissions for assignment 6"""
        response = requests.get(
            f"{self.base_url}/teacher/assignments/6/submissions",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        submissions = response.json()
        self.assertIsInstance(submissions, list)
        print(f"\nFound {len(submissions)} submissions for assignment 6")
        
        # Print submission details
        for sub in submissions:
            print(f"\nSubmission ID: {sub.get('id')}")
            print(f"Student: {sub.get('student_name')}")
            print(f"File Path: {sub.get('file_path')}")
            
            # Try to download the file if path exists
            if sub.get('file_path'):
                file_url = f"{self.base_url}/teacher/assignments/submissions/{sub['file_path']}"
                file_response = requests.get(file_url, headers=self.headers)
                print(f"File Download Status: {file_response.status_code}")
                if file_response.status_code == 200:
                    print("File content preview:", file_response.text[:100])

if __name__ == '__main__':
    unittest.main() 