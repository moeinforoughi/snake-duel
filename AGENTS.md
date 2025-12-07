## Development Stack

This project uses a full-stack Docker Compose setup with:
- **Frontend**: React + TypeScript with Vite, served via Nginx
- **Backend**: Python FastAPI, running on port 4000 internally
- **Database**: PostgreSQL (replacing SQLite)
- **Orchestration**: Docker Compose

## Backend Development

For backend development, use `uv` for dependency management.

### Useful Commands

    # Sync dependencies from lockfile
    uv sync

    # Add a new package
    uv add <PACKAGE-NAME>

    # Run Python files
    uv run python <PYTHON-FILE>
    
    # Run tests locally
    cd backend && PYTHONPATH=/workspaces/snake-duel/backend uv run pytest tests/ -v

## Docker Compose

### Quick Start

Start all services (frontend, backend, PostgreSQL) with:

    docker compose up --build -d

This will:
- Build and start the backend FastAPI server (port 8000 → 4000)
- Build and start the frontend React app via Nginx (port 80)
- Start PostgreSQL (port 5432)

### Access the Application

- Frontend: http://localhost
- Backend API: http://localhost/api (proxied through Nginx)
- Backend Direct: http://localhost:8000
- PostgreSQL: localhost:5432 (user: snakeuser, password: snakepass)

### View Logs

    # View logs from all services
    docker compose logs -f
    
    # View logs from a specific service
    docker compose logs -f backend
    docker compose logs -f frontend
    docker compose logs -f postgres

### Rebuild Services

    # Rebuild and restart all services
    docker compose up --build -d
    
    # Rebuild specific service
    docker compose up --build -d frontend

### Stop Services

    docker compose down

### Database

PostgreSQL runs in a Docker container with:
- Database: snake_duel
- User: snakeuser
- Password: snakepass
- Volume: pgdata (persisted between restarts)

## Development Workflow

regularly commit code to git

After any changes and before the commit:
1. Analyze files for any possible .gitignore changes or having any token or security issues
2. Run all tests that existed in any part of the app:
   - Backend: `cd backend && PYTHONPATH=/workspaces/snake-duel/backend uv run pytest tests/ -v`
   - Frontend: `cd frontend && npm run test`
3. When all tests pass, write the commit message and commit the changes