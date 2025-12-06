"""Pydantic schemas for request/response validation (package version)"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class PositionSchema(BaseModel):
    x: int
    y: int


class UserSchema(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime
    high_score: int


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class AuthResult(BaseModel):
    success: bool
    user: Optional[UserSchema] = None
    error: Optional[str] = None


class LeaderboardEntrySchema(BaseModel):
    id: str
    user_id: str
    username: str
    score: int
    mode: str
    date: datetime


class ScoreSubmissionRequest(BaseModel):
    score: int
    mode: str


class ScoreSubmissionResult(BaseModel):
    success: bool
    rank: Optional[int] = None


class ActivePlayerSchema(BaseModel):
    id: str
    username: str
    current_score: int
    mode: str
    snake: list[PositionSchema]
    food: PositionSchema
    direction: str
    is_playing: bool
