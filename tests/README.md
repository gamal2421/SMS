# API Testing Suite

This directory contains automated tests for the School Management System API endpoints.

## Structure

- `conftest.py`: Shared pytest fixtures and configuration
- `test_auth.py`: Authentication endpoint tests
- `test_assignments.py`: Assignment-related endpoint tests
- `test_grades.py`: Grade-related endpoint tests
- `requirements.txt`: Test dependencies

## Setup

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv test_venv
   source test_venv/bin/activate  # On Windows: test_venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running Tests

1. Make sure the API server is running:
   ```bash
   cd ..
   python start_server.py
   ```

2. In a new terminal, run the tests:
   ```bash
   # Run all tests
   pytest

   # Run specific test file
   pytest test_auth.py

   # Run with coverage report
   pytest --cov=.

   # Run tests in parallel
   pytest -n auto

   # Run with verbose output
   pytest -v
   ```

## Test Cases

### Authentication Tests
- Student login
- Teacher login
- Invalid login attempts

### Assignment Tests
- Get student assignments
- Get teacher assignments
- Submit assignment
- View submissions as teacher

### Grade Tests
- Get student grades
- Teacher grading assignments
- View class grades

## Adding New Tests

1. Create a new test file following the naming convention `test_*.py`
2. Import necessary fixtures from `conftest.py`
3. Write test functions using pytest assertions
4. Add test cases to this README

## Best Practices

1. Use fixtures for common setup/teardown
2. Clean up any test files or data after tests
3. Use meaningful test names and docstrings
4. Add appropriate assertions
5. Handle edge cases and error conditions 