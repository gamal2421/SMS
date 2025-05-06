"""
Assignment 1 Submission
Student: James Wilson
Date: 2024-03-15
"""

def calculate_factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * calculate_factorial(n-1)

def main():
    # Test the factorial function
    numbers = [5, 6, 7]
    for num in numbers:
        result = calculate_factorial(num)
        print(f"Factorial of {num} is: {result}")

if __name__ == "__main__":
    main() 