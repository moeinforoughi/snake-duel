"""Unit tests for SQLAlchemy models."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, User, ActivePlayer, LeaderboardEntry, Session as SessionModel


@pytest.fixture(scope="function")
def engine():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db(engine):
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.rollback()
    session.close()


def test_user_creation_and_high_score(db):
    user = User(id="u1", username="tuser", email="t@example.com", password_hash="pwd", high_score=5)
    db.add(user)
    db.commit()

    fetched = db.query(User).filter(User.email == "t@example.com").first()
    assert fetched is not None
    assert fetched.high_score == 5


def test_activeplayer_to_dict_and_snake_json(db):
    snake = [{"x": 1, "y": 2}, {"x": 2, "y": 2}]
    ap = ActivePlayer(
        id="p1",
        user_id="u1",
        username="player1",
        current_score=10,
        mode="classic",
        snake_json=str(snake).replace("'", '"'),
        food_x=5,
        food_y=5,
        direction="RIGHT",
        is_playing=True,
    )
    db.add(ap)
    db.commit()

    fetched = db.query(ActivePlayer).filter(ActivePlayer.id == "p1").first()
    d = fetched.to_dict()
    assert d["username"] == "player1"
    assert isinstance(d["snake"], list)


def test_session_and_leaderboard_entry(db):
    user = User(id="u2", username="u2", email="u2@example.com", password_hash="pw")
    db.add(user)
    db.commit()

    sess = SessionModel(token="tok1", user_id="u2")
    db.add(sess)
    entry = LeaderboardEntry(user_id="u2", username="u2", score=123, mode="classic")
    db.add(entry)
    db.commit()

    fetched_sess = db.query(SessionModel).filter(SessionModel.token == "tok1").first()
    assert fetched_sess is not None
    fetched_entry = db.query(LeaderboardEntry).filter(LeaderboardEntry.user_id == "u2").first()
    assert fetched_entry.score == 123
