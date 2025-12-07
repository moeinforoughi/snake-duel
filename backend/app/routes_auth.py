"""Authentication routes (package version)"""
from fastapi import APIRouter, Depends, Header, HTTPException, status
from typing import Optional
from .database import db, User
from .schemas import LoginRequest, SignupRequest, AuthResult, UserSchema

router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user(authorization: Optional[str] = Header(None)) -> User:
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

    user = db.get_user_from_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return user


@router.post("/login", response_model=AuthResult)
def login(request: LoginRequest) -> AuthResult:
    user = db.get_user_by_email(request.email)

    if not user or user.password_hash != request.password:
        return AuthResult(success=False, error="Invalid email or password")

    token = db.create_session(user.id)

    return AuthResult(
        success=True,
        user=UserSchema(
            id=user.id,
            username=user.username,
            email=user.email,
            created_at=user.created_at,
            high_score=user.high_score,
        ),
        error=None,
        token=token,
    )


@router.post("/signup", response_model=AuthResult, status_code=201)
def signup(request: SignupRequest) -> AuthResult:
    if db.get_user_by_email(request.email):
        return AuthResult(success=False, error="Email already registered")

    if db.get_user_by_username(request.username):
        return AuthResult(success=False, error="Username already taken")

    user = db.create_user(
        username=request.username,
        email=request.email,
        password_hash=request.password,
    )

    token = db.create_session(user.id)

    return AuthResult(
        success=True,
        user=UserSchema(
            id=user.id,
            username=user.username,
            email=user.email,
            created_at=user.created_at,
            high_score=user.high_score,
        ),
        error=None,
        token=token,
    )


@router.post("/logout", status_code=204)
def logout(authorization: Optional[str] = Header(None)) -> None:
    if authorization:
        try:
            scheme, token = authorization.split()
            if scheme.lower() == "bearer":
                db.delete_session(token)
        except ValueError:
            pass


@router.get("/me", response_model=UserSchema)
def get_current_user_info(user: User = Depends(get_current_user)) -> UserSchema:
    return UserSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        high_score=user.high_score,
    )
