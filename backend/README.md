# Snake Duel — Backend

This directory contains a small FastAPI backend for the Snake Duel project. It uses a mock in-memory database for development and tests. The application is organized as a package under `backend/app/`.

Quick overview
- App package: `backend/app/` (contains `database.py`, `schemas.py`, and route modules)
- Entrypoint: `backend/main.py` (creates the FastAPI `app` instance)
- Tests: `backend/test_main.py` (pytest-based)

Prerequisites
- Python 3.12
- `uv` (the workspace uses `uv` for dependency management — see `AGENTS.md`)

Install dependencies
Run this from the repository root or change into `backend/` first:

```bash
cd backend
uv sync --all-extras
```

This will create a local virtual environment at `backend/.venv` and install all dependencies (including dev extras like pytest) from `pyproject.toml`.

(Alternatively, use `uv sync` to install only production dependencies.)

Run the server (development)
Simple (recommended for development):

```bash
cd backend
uv run python main.py
```

This runs the `main.py` which starts a uvicorn server on `0.0.0.0:4000`.

Alternative (run uvicorn directly):

```bash
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 4000
```

Run tests

```bash
cd backend
uv run pytest -q
```

API examples
- Health: `GET /health`

```bash
curl http://localhost:4000/health
```

- Leaderboard: `GET /leaderboard`

```bash
curl http://localhost:4000/leaderboard
```

- Active players (watch mode): `GET /players/active`

```bash
curl http://localhost:4000/players/active
```

- Signup (creates a mock user):

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password"}' \
  http://localhost:4000/auth/signup
```

- Login (returns AuthResult but does not currently return a token in the mock implementation):

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password"}' \
  http://localhost:4000/auth/login
```

Important note about authentication (mock DB)
- This mock backend stores session tokens server-side in `app.database.db.sessions` and DOES NOT expose those tokens in HTTP responses.
- For integration tests or local experimentation you can create a token from a Python REPL and then use it in an `Authorization: Bearer <token>` header when calling protected endpoints (for example, `POST /leaderboard/score`). Example:

```bash
cd backend
uv run python -c "from app.database import db; u=list(db.users.values())[0]; token=db.create_session(u.id); print(token)"
# then use the printed token in requests
curl -X POST -H 'Content-Type: application/json' -H "Authorization: Bearer <TOKEN>" \
  -d '{"score":100,"mode":"walls"}' http://localhost:4000/leaderboard/score
```

Project layout (relevant files)
- `backend/app/database.py` — mock database and models
- `backend/app/schemas.py` — pydantic schemas
- `backend/app/routes_auth.py` — auth endpoints
- `backend/app/routes_leaderboard.py` — leaderboard endpoints
- `backend/app/routes_players.py` — watch mode / players endpoints
- `backend/main.py` — app factory and server entrypoint
- `backend/test_main.py` — pytest suite

Notes & next steps
- The mock DB is temporary. When ready, replace `app.database` with a persistent store (SQLite/Postgres) and return tokens from `login/signup` endpoints.
- Consider adding a small `.env` or configuration for host/port and secrets when moving to a non-mock DB.

If you'd like, I can:
- Move `main.py` inside the `app/` package and expose `create_app` from `app.__init__` for a cleaner package layout;
- Add a small Dockerfile and `docker-compose` for local development;
- Make auth endpoints return JWT tokens for real integrations.
