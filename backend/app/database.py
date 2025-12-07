"""Database configuration and models using SQLAlchemy ORM"""
import os
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import uuid

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./snake_duel.db"  # Default to SQLite for development
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",  # Debug SQL queries if needed
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base for models
Base = declarative_base()


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    high_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "high_score": self.high_score,
            "created_at": self.created_at,
        }


class LeaderboardEntry(Base):
    """Leaderboard entry model"""
    __tablename__ = "leaderboard_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    username = Column(String(255), nullable=False)  # Denormalized for easy access
    score = Column(Integer, nullable=False)
    mode = Column(String(50), nullable=False, index=True)  # 'walls' or 'passthrough'
    date = Column(DateTime, default=datetime.now, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="leaderboard_entries")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.username,
            "score": self.score,
            "mode": self.mode,
            "date": self.date,
        }


class Session(Base):
    """Session/Token model for authentication"""
    __tablename__ = "sessions"

    token = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration

    # Relationships
    user = relationship("User", back_populates="sessions")

    def to_dict(self):
        return {
            "token": self.token,
            "user_id": self.user_id,
            "created_at": self.created_at,
            "expires_at": self.expires_at,
        }


class ActivePlayer(Base):
    """Active player in watch mode"""
    __tablename__ = "active_players"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    username = Column(String(255), nullable=False)
    current_score = Column(Integer, default=0)
    mode = Column(String(50), nullable=False)  # 'walls' or 'passthrough'
    snake_json = Column(String(1000), nullable=False)  # JSON string of snake positions
    food_x = Column(Integer, nullable=False)
    food_y = Column(Integer, nullable=False)
    direction = Column(String(10), nullable=False)  # 'UP', 'DOWN', 'LEFT', 'RIGHT'
    is_playing = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "username": self.username,
            "current_score": self.current_score,
            "mode": self.mode,
            "snake": json.loads(self.snake_json),
            "food": {"x": self.food_x, "y": self.food_y},
            "direction": self.direction,
            "is_playing": self.is_playing,
        }


def get_db():
    """Dependency injection for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
