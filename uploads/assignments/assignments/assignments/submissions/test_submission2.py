"""
Test Submission 2
Student: Test Student 2
Date: 2024-03-16
"""

def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def main():
    # Test the fibonacci function
    test_cases = [0, 1, 5, 10]
    for n in test_cases:
        result = fibonacci(n)
        print(f"Fibonacci({n}) = {result}")

if __name__ == "__main__":
    main() 