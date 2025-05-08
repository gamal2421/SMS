import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(response):
    print(f"\nStatus: {response.status_code}")
    try:
        print(f"Response: {response.json()}")
    except:
        print(f"Response text: {response.text}")

def test_login(email, password):
    print("\nTesting login...")
    response = requests.post(
        f"{BASE_URL}/auth/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "username": email,
            "password": password,
            "grant_type": "password"
        }
    )
    print_response(response)
    return response.json().get("access_token") if response.ok else None

def test_crud_operations(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Test creating a student
    print("\nTesting create student...")
    student_data = {
        "email": "new.student@school.com",
        "full_name": "New Student",
        "role": "student",
        "password": "student123",
        "grade": "10",
        "section": "A",
        "contact": "123-456-7890"
    }
    response = requests.post(f"{BASE_URL}/admin/students", headers=headers, json=student_data)
    print_response(response)
    student_id = response.json().get("id") if response.ok else None

    if student_id:
        # Test updating student
        print("\nTesting update student...")
        update_data = {
            "grade": "11",
            "section": "B",
            "contact": "987-654-3210"
        }
        response = requests.put(f"{BASE_URL}/admin/students/{student_id}", headers=headers, json=update_data)
        print_response(response)

        # Test deleting student
        print("\nTesting delete student...")
        response = requests.delete(f"{BASE_URL}/admin/students/{student_id}", headers=headers)
        print_response(response)

        # Verify student is deleted
        print("\nVerifying student deletion...")
        response = requests.get(f"{BASE_URL}/admin/students/{student_id}", headers=headers)
        print_response(response)

    # Test creating a teacher
    print("\nTesting create teacher...")
    teacher_data = {
        "email": "new.teacher@school.com",
        "full_name": "New Teacher",
        "role": "teacher",
        "password": "teacher123",
        "subject": "Physics",
        "qualification": "Ph.D.",
        "contact": "123-456-7890",
        "bio": "New teacher bio"
    }
    response = requests.post(f"{BASE_URL}/admin/teachers", headers=headers, json=teacher_data)
    print_response(response)
    teacher_id = response.json().get("id") if response.ok else None

    if teacher_id:
        # Test updating teacher
        print("\nTesting update teacher...")
        update_data = {
            "subject": "Advanced Physics",
            "qualification": "Ph.D. in Physics",
            "contact": "987-654-3210"
        }
        response = requests.put(f"{BASE_URL}/admin/teachers/{teacher_id}", headers=headers, json=update_data)
        print_response(response)

        # Test creating a class with the new teacher
        print("\nTesting create class...")
        class_data = {
            "name": "Advanced Physics 101",
            "grade": "12",
            "section": "A",
            "subject": "Physics",
            "teacher_id": teacher_id,
            "capacity": 30,
            "current_students": 0,
            "schedule": "Mon, Wed 9:00-10:30",
            "room": "Lab 201",
            "description": "Advanced physics class"
        }
        response = requests.post(f"{BASE_URL}/admin/classes", headers=headers, json=class_data)
        print_response(response)
        class_id = response.json().get("id") if response.ok else None

        if class_id:
            # Test updating class
            print("\nTesting update class...")
            update_data = {
                "capacity": 35,
                "current_students": 5,
                "description": "Updated advanced physics class"
            }
            response = requests.put(f"{BASE_URL}/admin/classes/{class_id}", headers=headers, json=update_data)
            print_response(response)

            # Test deleting class
            print("\nTesting delete class...")
            response = requests.delete(f"{BASE_URL}/admin/classes/{class_id}", headers=headers)
            print_response(response)

            # Verify class is deleted
            print("\nVerifying class deletion...")
            response = requests.get(f"{BASE_URL}/admin/classes/{class_id}", headers=headers)
            print_response(response)

        # Test deleting teacher
        print("\nTesting delete teacher...")
        response = requests.delete(f"{BASE_URL}/admin/teachers/{teacher_id}", headers=headers)
        print_response(response)

        # Verify teacher is deleted
        print("\nVerifying teacher deletion...")
        response = requests.get(f"{BASE_URL}/admin/teachers/{teacher_id}", headers=headers)
        print_response(response)

def main():
    # Test admin login
    token = test_login("admin@school.com", "admin123")
    if token:
        print("\nLogin successful! Testing CRUD operations...")
        test_crud_operations(token)
    else:
        print("\nLogin failed! Cannot test CRUD operations.")

if __name__ == "__main__":
    main() 