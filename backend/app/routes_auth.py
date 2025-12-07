"""Authentication routes using SQLAlchemy"""
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from .database import get_db, User, Session as SessionModel
from .schemas import LoginRequest, SignupRequest, AuthResult, UserSchema

router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Get current authenticated user from token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid auth scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    # Look up session in database
    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = session.user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return user


@router.post("/signup", response_model=AuthResult, status_code=201)
def signup(request: SignupRequest, db: Session = Depends(get_db)) -> AuthResult:
    """Sign up a new user"""
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == request.email).first()
    if existing_email:
        return AuthResult(success=False, error="Email already registered")

    # Check if username already exists
    existing_username = db.query(User).filter(User.username == request.username).first()
    if existing_username:
        return AuthResult(success=False, error="Username already taken")

    # Create new user
    user = User(
        id=str(uuid.uuid4()),
        username=request.username,
        email=request.email,
        password_hash=request.password,  # TODO: Hash password in production
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create session token
    token = str(uuid.uuid4())
    session = SessionModel(token=token, user_id=user.id)
    db.add(session)
    db.commit()

    return AuthResult(
        success=True,
        user=UserSchema(
            id=user.id,
            username=user.username,
            email=user.email,
            created_at=user.created_at,
            high_score=user.high_score,
        ),
        token=token,
    )


@router.post("/login", response_model=AuthResult)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> AuthResult:
    """Login with email and password"""
    user = db.query(User).filter(User.email == request.email).first()

    if not user or user.password_hash != request.password:  # TODO: Use proper password verification
        return AuthResult(success=False, error="Invalid email or password")

    # Create session token
    token = str(uuid.uuid4())
    session = SessionModel(token=token, user_id=user.id)
    db.add(session)
    db.commit()

    return AuthResult(
        success=True,
        user=UserSchema(
            id=user.id,
            username=user.username,
            email=user.email,
            created_at=user.created_at,
            high_score=user.high_score,
        ),
        token=token,
    )


@router.post("/logout", status_code=204)
def logout(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> None:
    """Logout by deleting session token"""
    if authorization:
        try:
            scheme, token = authorization.split()
            if scheme.lower() == "bearer":
                session = db.query(SessionModel).filter(SessionModel.token == token).first()
                if session:
                    db.delete(session)
                    db.commit()
        except ValueError:
            pass


@router.get("/me", response_model=UserSchema)
def get_current_user_info(user: User = Depends(get_current_user)) -> UserSchema:
    """Get current user information"""
    return UserSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        high_score=user.high_score,
    )
