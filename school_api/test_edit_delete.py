import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_response(response):
    print(f"\nStatus: {response.status_code}")
    try:
        print(f"Response: {response.json()}")
    except:
        print(f"Response text: {response.text}")

def test_edit_delete():
    # Login
    print("\nLogging in...")
    response = requests.post(
        f"{BASE_URL}/auth/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "username": "admin@school.com",
            "password": "admin123",
            "grant_type": "password"
        }
    )
    print_response(response)
    
    if not response.ok:
        print("Login failed!")
        return

    token = response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Create a test student
    print("\nCreating test student...")
    student_data = {
        "email": f"test.student{int(time.time())}@school.com",
        "full_name": "Test Student",
        "password": "student123",
        "role": "student",
        "grade": "10",
        "section": "A",
        "contact": "123-456-7890"
    }
    response = requests.post(
        f"{BASE_URL}/admin/students",
        headers=headers,
        json=student_data
    )
    print_response(response)

    if not response.ok:
        print("Failed to create student!")
        return

    student_id = response.json()["id"]
    print(f"\nCreated student with ID: {student_id}")

    # Test editing student
    print("\nEditing student...")
    update_data = {
        "grade": "11",
        "section": "B",
        "contact": "987-654-3210"
    }
    response = requests.put(
        f"{BASE_URL}/admin/students/{student_id}",
        headers=headers,
        json=update_data
    )
    print_response(response)

    # Verify the edit
    print("\nVerifying edit...")
    response = requests.get(
        f"{BASE_URL}/admin/students/{student_id}",
        headers=headers
    )
    print_response(response)

    # Test deleting student
    print("\nDeleting student...")
    response = requests.delete(
        f"{BASE_URL}/admin/students/{student_id}",
        headers=headers
    )
    print_response(response)

    # Verify the deletion
    print("\nVerifying deletion...")
    response = requests.get(
        f"{BASE_URL}/admin/students/{student_id}",
        headers=headers
    )
    print_response(response)

if __name__ == "__main__":
    test_edit_delete() 