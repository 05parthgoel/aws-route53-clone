from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import database
import models
import schemas

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    # Simple mocked authentication: accepts any non-empty username/password or checks user
    user = db.query(models.User).filter(models.User.username == login_data.username).first()
    if not user:
        # Auto-create user for seamless AWS mock login
        user = models.User(
            username=login_data.username,
            aws_account_id=login_data.aws_account_id or "1234-5678-9012",
            hashed_password="mock_hashed_password"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    mock_token = f"aws-token-{user.id}-{uuid.uuid4().hex[:8]}"
    return {
        "access_token": mock_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user(token: str = "mock-token", db: Session = Depends(database.get_db)):
    user = db.query(models.User).first()
    if not user:
        user = models.User(username="aws-admin", aws_account_id="1234-5678-9012", hashed_password="mock")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
