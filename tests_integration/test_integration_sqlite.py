"""Integration tests using a real SQLite database file.

These tests set `DATABASE_URL` to a temporary SQLite file and then
create the FastAPI app and database schema. They exercise the full
request path via `TestClient` (signup, submit score, leaderboard).
"""
import os
import importlib
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


def create_app_with_sqlite(tmp_path: Path):
    # Prepare a temporary sqlite file and set env var before importing app modules
    db_file = tmp_path / "integration.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_file}"

    # Reload database module so it picks up the env var and creates an engine
    import app.database as dbmod

    importlib.reload(dbmod)

    # Import/create the app after the database module has been reloaded
    import main as main_mod

    importlib.reload(main_mod)
    app = main_mod.create_app()

    # Ensure tables exist in the sqlite file
    dbmod.Base.metadata.create_all(bind=dbmod.engine)

    return app, dbmod


def test_signup_submit_and_leaderboard(tmp_path):
    app, dbmod = create_app_with_sqlite(tmp_path)
    client = TestClient(app)

    # Signup a new user
    resp = client.post(
        "/auth/signup",
        json={"username": "integuser", "email": "integ@example.com", "password": "password123"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body.get("success") is True
    token = body.get("token")
    assert token

    # Submit a score using Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post(
        "/leaderboard/score", json={"score": 250, "mode": "classic"}, headers=headers
    )
    assert resp.status_code == 200
    submission = resp.json()
    assert submission.get("success") is True
    assert isinstance(submission.get("rank"), int)

    # Retrieve the leaderboard and verify our entry is present
    resp = client.get("/leaderboard")
    assert resp.status_code == 200
    entries = resp.json()
    assert isinstance(entries, list)
    assert any(e["username"] == "integuser" and e["score"] == 250 for e in entries)


def test_login_and_logout_flow(tmp_path):
    app, dbmod = create_app_with_sqlite(tmp_path)
    client = TestClient(app)

    # Create user via signup
    resp = client.post(
        "/auth/signup",
        json={"username": "loginuser", "email": "login@example.com", "password": "pwd"},
    )
    assert resp.status_code == 201
    token = resp.json().get("token")

    # Login with correct credentials
    resp = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "pwd"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body.get("success") is True
    login_token = body.get("token")
    assert login_token

    # Logout using header
    headers = {"Authorization": f"Bearer {login_token}"}
    resp = client.post("/auth/logout", headers=headers)
    # logout returns 204 No Content
    assert resp.status_code in (200, 204)
