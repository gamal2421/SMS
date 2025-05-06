from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from .routers import auth, admin, public, teacher, student
from .config import settings
from .database import engine, Base
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("school_api")

logger.info("Starting FastAPI application initialization...")

app = FastAPI(
    title="School Management System API",
    description="API for School Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Create the database tables
Base.metadata.create_all(bind=engine)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log request details
        start_time = time.time()
        path = request.url.path
        method = request.method
        logger.info(f"Request started: {method} {path}")
        logger.info(f"Request headers: {dict(request.headers)}")  # Add this line to log headers
        
        try:
            response = await call_next(request)
            
            # Log response details
            process_time = time.time() - start_time
            status_code = response.status_code
            logger.info(f"Request completed: {method} {path} - Status: {status_code} - Time: {process_time:.3f}s")
            
            return response
        except Exception as e:
            # Log exceptions
            process_time = time.time() - start_time
            logger.error(f"Request failed: {method} {path} - Error: {str(e)} - Time: {process_time:.3f}s")
            raise

app.add_middleware(RequestLoggingMiddleware)

# Include routers
logger.info("Registering routers...")

logger.info("Registering auth router...")
app.include_router(auth.router, prefix="/auth", tags=["auth"])

logger.info("Registering admin router...")
app.include_router(admin.router, prefix="/admin", tags=["admin"])

logger.info("Registering public router...")
app.include_router(public.router, prefix="/public", tags=["Public"])

logger.info("Registering teacher router...")
app.include_router(teacher.router, prefix="/teacher", tags=["teacher"])

logger.info("Registering student router...")
app.include_router(student.router, prefix="/student", tags=["student"])

logger.info("All routers registered successfully!")

@app.get("/")
async def root():
    return {"message": "Welcome to School Management System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/_debug/routes", include_in_schema=True)
async def list_routes():
    """List all registered routes for debugging"""
    routes = []
    for route in app.routes:
        routes.append({
            "path": route.path,
            "name": route.name,
            "methods": list(route.methods) if route.methods else []
        })
    return routes

@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS is working!"}

@app.options("/test-cors")
async def test_cors_preflight():
    return {"message": "Preflight request successful"} 