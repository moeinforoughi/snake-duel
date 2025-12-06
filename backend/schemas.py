"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class PositionSchema(BaseModel):
    """Position schema for snake and food"""

    x: int
    y: int


class UserSchema(BaseModel):
    """User response schema"""

    id: str
    username: str
    email: str
    created_at: datetime
    high_score: int


class LoginRequest(BaseModel):
    """Login request schema"""

    email: str
    password: str


class SignupRequest(BaseModel):
    """Signup request schema"""

    username: str
    email: str
    password: str


class AuthResult(BaseModel):
    """Authentication result schema"""

    success: bool
    user: Optional[UserSchema] = None
    error: Optional[str] = None


class LeaderboardEntrySchema(BaseModel):
    """Leaderboard entry schema"""

    id: str
    user_id: str
    username: str
    score: int
    mode: str
    date: datetime


class ScoreSubmissionRequest(BaseModel):
    """Score submission request schema"""

    score: int
    mode: str


class ScoreSubmissionResult(BaseModel):
    """Score submission result schema"""

    success: bool
    rank: Optional[int] = None


class ActivePlayerSchema(BaseModel):
    """Active player schema"""

    id: str
    username: str
    current_score: int
    mode: str
    snake: list[PositionSchema]
    food: PositionSchema
    direction: str
    is_playing: bool
