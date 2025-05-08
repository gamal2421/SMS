from setuptools import setup, find_packages

setup(
    name="school_api",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "alembic",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-multipart",
        "email-validator",
        "python-dotenv"
    ]
) 