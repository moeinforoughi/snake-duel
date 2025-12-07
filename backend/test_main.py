"""Tests for Snake Duel API with SQLAlchemy"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from main import create_app
from app.database import Base, get_db


# Create a temporary database for testing
@pytest.fixture(scope="function")
def db_engine():
    """Create a test database engine"""
    # Use SQLite in-memory database for tests with thread safety disabled
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a test database session"""
    TestingSessionLocal = sessionmaker(
        bind=db_engine, autoflush=False, autocommit=False
    )
    session = TestingSessionLocal()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def app(db_engine, db_session):
    """Create a test app instance with test database"""
    app = create_app()
    
    # Override the get_db dependency to use test database
    def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    yield app
    app.dependency_overrides.clear()


@pytest.fixture
def client(app):
    """Create a test client"""
    return TestClient(app, raise_server_exceptions=True)


class TestHealth:
    """Health check tests"""

    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Snake Duel API"

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAuth:
    """Authentication tests"""

    def test_signup_success(self, client):
        """Test successful signup"""
        response = client.post(
            "/auth/signup",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["user"]["username"] == "newuser"
        assert data["user"]["email"] == "newuser@example.com"
        assert data["token"] is not None

    def test_signup_duplicate_email(self, client):
        """Test signup with duplicate email"""
        # First signup
        client.post(
            "/auth/signup",
            json={
                "username": "user1",
                "email": "duplicate@example.com",
                "password": "password123",
            },
        )

        # Second signup with same email
        response = client.post(
            "/auth/signup",
            json={
                "username": "user2",
                "email": "duplicate@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is False
        assert "already registered" in data["error"].lower()

    def test_signup_duplicate_username(self, client):
        """Test signup with duplicate username"""
        # First signup
        client.post(
            "/auth/signup",
            json={
                "username": "duplicateuser",
                "email": "user1@example.com",
                "password": "password123",
            },
        )

        # Second signup with same username
        response = client.post(
            "/auth/signup",
            json={
                "username": "duplicateuser",
                "email": "user2@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is False
        assert "already taken" in data["error"].lower()

    def test_login_success(self, client):
        """Test successful login"""
        # Create a user first
        signup_response = client.post(
            "/auth/signup",
            json={
                "username": "loginuser",
                "email": "loginuser@example.com",
                "password": "password123",
            },
        )
        assert signup_response.status_code == 201

        # Login
        response = client.post(
            "/auth/login",
            json={
                "email": "loginuser@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["email"] == "loginuser@example.com"
        assert data["token"] is not None

    def test_login_wrong_password(self, client):
        """Test login with wrong password"""
        # Create a user first
        client.post(
            "/auth/signup",
            json={
                "username": "wrongpass",
                "email": "wrongpass@example.com",
                "password": "correctpassword",
            },
        )

        # Login with wrong password
        response = client.post(
            "/auth/login",
            json={
                "email": "wrongpass@example.com",
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "Invalid" in data["error"]

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email"""
        response = client.post(
            "/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False

    def test_logout(self, client):
        """Test logout"""
        # Create and login a user
        signup_response = client.post(
            "/auth/signup",
            json={
                "username": "logoutuser",
                "email": "logoutuser@example.com",
                "password": "password123",
            },
        )
        token = signup_response.json()["token"]

        # Logout
        response = client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 204

    def test_get_current_user(self, client):
        """Test get current user endpoint"""
        # Create and login a user
        signup_response = client.post(
            "/auth/signup",
            json={
                "username": "currentuser",
                "email": "current@example.com",
                "password": "password123",
            },
        )
        token = signup_response.json()["token"]

        # Get current user
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "currentuser"
        assert data["email"] == "current@example.com"

    def test_get_current_user_invalid_token(self, client):
        """Test get current user with invalid token"""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401


class TestLeaderboard:
    """Leaderboard tests"""

    def test_get_leaderboard_empty(self, client):
        """Test getting empty leaderboard"""
        response = client.get("/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_submit_score_authenticated(self, client):
        """Test submitting score with authentication"""
        # Create and login a user
        signup_response = client.post(
            "/auth/signup",
            json={
                "username": "scoreuser",
                "email": "scoreuser@example.com",
                "password": "password123",
            },
        )
        token = signup_response.json()["token"]

        # Submit score
        response = client.post(
            "/leaderboard/score",
            json={"score": 500, "mode": "walls"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["rank"] is not None
        assert isinstance(data["rank"], int)

    def test_submit_score_unauthenticated(self, client):
        """Test submitting score without authentication"""
        response = client.post(
            "/leaderboard/score",
            json={"score": 500, "mode": "walls"},
        )
        assert response.status_code == 401

    def test_leaderboard_ranking(self, client):
        """Test leaderboard ranking"""
        # Create users and submit scores
        for i in range(3):
            signup_response = client.post(
                "/auth/signup",
                json={
                    "username": f"player{i}",
                    "email": f"player{i}@example.com",
                    "password": "password123",
                },
            )
            token = signup_response.json()["token"]
            
            # Submit different scores
            client.post(
                "/leaderboard/score",
                json={"score": 100 * (i + 1), "mode": "walls"},
                headers={"Authorization": f"Bearer {token}"},
            )

        # Check leaderboard
        response = client.get("/leaderboard?limit=10&mode=walls")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Scores should be in descending order
        assert data[0]["score"] > data[1]["score"]
        assert data[1]["score"] > data[2]["score"]

    def test_leaderboard_filter_by_mode(self, client):
        """Test leaderboard filtering by mode"""
        # Create user
        signup_response = client.post(
            "/auth/signup",
            json={
                "username": "modeuser",
                "email": "modeuser@example.com",
                "password": "password123",
            },
        )
        token = signup_response.json()["token"]

        # Submit scores in different modes
        client.post(
            "/leaderboard/score",
            json={"score": 100, "mode": "walls"},
            headers={"Authorization": f"Bearer {token}"},
        )
        client.post(
            "/leaderboard/score",
            json={"score": 200, "mode": "passthrough"},
            headers={"Authorization": f"Bearer {token}"},
        )

        # Check walls mode only
        response = client.get("/leaderboard?mode=walls")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["mode"] == "walls"
        assert data[0]["score"] == 100


class TestPlayers:
    """Players/watch mode tests"""

    def test_get_active_players_empty(self, client):
        """Test getting active players when none exist"""
        response = client.get("/players/active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_nonexistent_player(self, client):
        """Test getting a player that doesn't exist"""
        response = client.get("/players/nonexistent")
        assert response.status_code == 404


class TestEdgeCases:
    """Test edge cases and error handling"""

    def test_signup_missing_fields(self, client):
        """Test signup with missing fields"""
        response = client.post(
            "/auth/signup",
            json={"username": "incomplete"},
        )
        assert response.status_code == 422  # Validation error

    def test_login_missing_fields(self, client):
        """Test login with missing fields"""
        response = client.post(
            "/auth/login",
            json={"email": "test@example.com"},
        )
        assert response.status_code == 422  # Validation error

    def test_submit_score_invalid_mode(self, client):
        """Test submitting score with invalid mode"""
        signup_response = client.post(
            "/auth/signup",
            json={
                "username": "invalidmode",
                "email": "invalidmode@example.com",
                "password": "password123",
            },
        )
        token = signup_response.json()["token"]

        # This should still work - we don't validate modes on the backend
        response = client.post(
            "/leaderboard/score",
            json={"score": 100, "mode": "invalid_mode"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
