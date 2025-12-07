# Snake Duel — Backend

This directory contains a FastAPI backend for the Snake Duel project using SQLAlchemy ORM with support for both SQLite (development) and PostgreSQL (production). The application is organized as a package under `backend/app/`.

Quick overview
- App package: `backend/app/` (contains SQLAlchemy models, schemas, and route modules)
- Database: SQLAlchemy ORM with SQLite (dev) and PostgreSQL (production) support
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

Database Configuration

**Development (SQLite - Default)**
No configuration needed. SQLite database will be created automatically at `backend/snake_duel.db`

**Production (PostgreSQL)**
Set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/snake_duel"
```

Or create a `.env` file (see `.env.example`):

```bash
cp .env.example .env
# Edit .env with your database URL
```

Run the server (development)
Simple (recommended for development):

```bash
cd backend
uv run python main.py
```

This runs the `main.py` which:
1. Initializes the database (creates tables if needed)
2. Starts a uvicorn server on `0.0.0.0:4000`

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

- Signup (creates a new user and returns auth token):

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password"}' \
  http://localhost:4000/auth/signup

# Response:
# {
#   "success": true,
#   "user": {...},
#   "token": "uuid-token-here",
#   "error": null
# }
```

- Login (returns auth token):

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password"}' \
  http://localhost:4000/auth/login
```

- Submit score (requires authentication):

```bash
# Use the token from signup/login
TOKEN="your-token-from-signup"

curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"score":100,"mode":"walls"}' \
  http://localhost:4000/leaderboard/score
```

Authentication & Sessions
- Tokens are persisted in the database (SQLite or PostgreSQL)
- Tokens are returned in auth responses and must be stored by the client
- Use `Authorization: Bearer <token>` header for authenticated requests
- Tokens are created on signup and login, and deleted on logout
- The frontend automatically stores tokens in localStorage and includes them in all API requests

Project layout (relevant files)
- `backend/app/database.py` — SQLAlchemy ORM models (User, LeaderboardEntry, Session, ActivePlayer)
- `backend/app/schemas.py` — Pydantic request/response schemas
- `backend/app/routes_auth.py` — Authentication endpoints (signup, login, logout, me)
- `backend/app/routes_leaderboard.py` — Leaderboard endpoints
- `backend/app/routes_players.py` — Watch mode / active players endpoints
- `backend/main.py` — FastAPI app factory and server entrypoint
- `backend/.env.example` — Environment variables template
- `backend/test_main.py` — pytest suite

Notes & Next Steps
- ✅ Database: SQLAlchemy ORM with SQLite (dev) and PostgreSQL (production) support
- ✅ Authentication: Tokens stored in database and returned from endpoints
- TODO: Add password hashing (use `bcrypt` or `argon2`)
- TODO: Setup Alembic for schema migrations
- TODO: Add database constraints and indexes for better performance
- TODO: Consider JWT tokens for stateless authentication at scale
- TODO: Add Docker/docker-compose for containerized development

Future Improvements
- Add relationship eager loading optimization to reduce N+1 queries
- Implement token expiration
- Add rate limiting for auth endpoints
- Setup database backup and recovery procedures
- Add logging and monitoring
