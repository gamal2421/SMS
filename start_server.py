import uvicorn
import os
from subprocess import Popen
import sys

if __name__ == "__main__":
    # Get directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Change working directory to the script directory
    os.chdir(current_dir)
    
    print("Starting School Management System...")
    
    # Start backend API server
    uvicorn.run("school_api.app.main:app", host="0.0.0.0", port=8000, reload=True) 