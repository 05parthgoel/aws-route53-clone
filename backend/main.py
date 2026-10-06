from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from seed import seed_database
from routers import auth, zones, records

# Initialize database tables
Base.metadata.create_all(bind=engine)
# Seed initial sample data
seed_database()

app = FastAPI(
    title="AWS Route53 Clone API",
    description="Backend API for AWS Route53 web application clone",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(zones.router)
app.include_router(records.router)

@app.get("/")
def root():
    return {
        "service": "AWS Route53 Clone API",
        "status": "healthy",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
