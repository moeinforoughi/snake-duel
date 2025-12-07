"""Mock database for Snake Duel API (package version)"""
from datetime import datetime, timedelta
from typing import Optional
import uuid


class User:
    """User model"""

    def __init__(
        self,
        id: str,
        username: str,
        email: str,
        password_hash: str,
        created_at: datetime,
        high_score: int = 0,
    ):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at
        self.high_score = high_score


class LeaderboardEntry:
    """Leaderboard entry model"""

    def __init__(
        self,
        id: str,
        user_id: str,
        username: str,
        score: int,
        mode: str,
        date: datetime,
    ):
        self.id = id
        self.user_id = user_id
        self.username = username
        self.score = score
        self.mode = mode
        self.date = date


class Position:
    """Position model for snake and food"""

    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y


class ActivePlayer:
    """Active player in watch mode"""

    def __init__(
        self,
        id: str,
        username: str,
        current_score: int,
        mode: str,
        snake: list[Position],
        food: Position,
        direction: str,
        is_playing: bool,
    ):
        self.id = id
        self.username = username
        self.current_score = current_score
        self.mode = mode
        self.snake = snake
        self.food = food
        self.direction = direction
        self.is_playing = is_playing


class MockDatabase:
    """Mock database for development"""

    def __init__(self):
        self.users: dict[str, User] = {}
        self.leaderboard: list[LeaderboardEntry] = []
        self.active_players: dict[str, ActivePlayer] = {}
        self.sessions: dict[str, str] = {}  # token -> user_id

    def create_user(self, username: str, email: str, password_hash: str) -> User:
        """Create a new user"""
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            username=username,
            email=email,
            password_hash=password_hash,
            created_at=datetime.now(),
            high_score=0,
        )
        self.users[user_id] = user
        return user

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.users.get(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        for user in self.users.values():
            if user.username == username:
                return user
        return None

    def create_session(self, user_id: str) -> str:
        """Create a session token for a user"""
        token = str(uuid.uuid4())
        self.sessions[token] = user_id
        return token

    def get_user_from_token(self, token: str) -> Optional[User]:
        """Get user from session token"""
        user_id = self.sessions.get(token)
        if user_id:
            return self.get_user_by_id(user_id)
        return None

    def delete_session(self, token: str) -> bool:
        """Delete a session"""
        if token in self.sessions:
            del self.sessions[token]
            return True
        return False

    def add_leaderboard_entry(
        self, user_id: str, username: str, score: int, mode: str
    ) -> LeaderboardEntry:
        """Add a leaderboard entry"""
        entry = LeaderboardEntry(
            id=str(uuid.uuid4()),
            user_id=user_id,
            username=username,
            score=score,
            mode=mode,
            date=datetime.now(),
        )
        self.leaderboard.append(entry)

        # Update user's high score if needed
        user = self.get_user_by_id(user_id)
        if user and score > user.high_score:
            user.high_score = score

        return entry

    def get_leaderboard(self, limit: int = 10, mode: Optional[str] = None) -> list[LeaderboardEntry]:
        """Get leaderboard entries, optionally filtered by mode"""
        entries = self.leaderboard
        if mode:
            entries = [e for e in entries if e.mode == mode]

        # Sort by score descending, then by date descending
        sorted_entries = sorted(
            entries, key=lambda e: (-e.score, -e.date.timestamp())
        )
        if limit is None:
            return sorted_entries
        return sorted_entries[:limit]

    def get_leaderboard_rank(self, score: int, mode: Optional[str] = None) -> Optional[int]:
        """Get the rank of a score in the leaderboard"""
        leaderboard = self.get_leaderboard(limit=None, mode=mode)
        for i, entry in enumerate(leaderboard, 1):
            if entry.score <= score:
                return i
        return None

    def set_active_player(self, player: ActivePlayer) -> None:
        """Set an active player"""
        self.active_players[player.id] = player

    def get_active_player(self, player_id: str) -> Optional[ActivePlayer]:
        """Get an active player by ID"""
        return self.active_players.get(player_id)

    def get_all_active_players(self) -> list[ActivePlayer]:
        """Get all active players"""
        return list(self.active_players.values())

    def remove_active_player(self, player_id: str) -> bool:
        """Remove an active player"""
        if player_id in self.active_players:
            del self.active_players[player_id]
            return True
        return False


# Global database instance
db = MockDatabase()
