"""Integration tests for leaderboard ranking and active players endpoints."""
import os
import importlib
import sys
from pathlib import Path

from fastapi.testclient import TestClient
import pytest


def create_app_with_sqlite(tmp_path: Path):
    db_file = tmp_path / "integration2.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_file}"
    repo_root = Path(__file__).resolve().parents[1]
    backend_path = repo_root / "backend"
    if str(backend_path) not in sys.path:
        sys.path.insert(0, str(backend_path))

    import app.database as dbmod
    importlib.reload(dbmod)

    import main as main_mod
    importlib.reload(main_mod)
    app = main_mod.create_app()
    dbmod.Base.metadata.create_all(bind=dbmod.engine)
    return app, dbmod


def signup_user(client: TestClient, username: str, email: str, password: str = "pwd") -> str:
    resp = client.post("/auth/signup", json={"username": username, "email": email, "password": password})
    assert resp.status_code in (200, 201)
    return resp.json()["token"]


def test_leaderboard_ranking_multiuser(tmp_path):
    app, dbmod = create_app_with_sqlite(tmp_path)
    client = TestClient(app)

    users = [
        ("u1", "u1@example.com", 50),
        ("u2", "u2@example.com", 200),
        ("u3", "u3@example.com", 150),
    ]

    tokens = {}
    for uname, email, score in users:
        token = signup_user(client, uname, email)
        tokens[uname] = token
        client.post("/leaderboard/score", json={"score": score, "mode": "classic"}, headers={"Authorization": f"Bearer {token}"})

    resp = client.get("/leaderboard?limit=10&mode=classic")
    assert resp.status_code == 200
    entries = resp.json()
    # Expect order: u2 (200), u3 (150), u1 (50)
    assert entries[0]["username"] == "u2"
    assert entries[1]["username"] == "u3"
    assert entries[2]["username"] == "u1"


def test_active_players_endpoint(tmp_path):
    app, dbmod = create_app_with_sqlite(tmp_path)
    client = TestClient(app)

    # Insert an active player directly using the DB session
    session = dbmod.SessionLocal()
    try:
        ap = dbmod.ActivePlayer(
            id="ap1",
            user_id="u_ap",
            username="watcher",
            current_score=42,
            mode="classic",
            snake_json='[{"x":0,"y":0}]',
            food_x=5,
            food_y=5,
            direction="UP",
            is_playing=True,
        )
        session.add(ap)
        session.commit()
    finally:
        session.close()

    resp = client.get("/players/active")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(p["username"] == "watcher" for p in data)
