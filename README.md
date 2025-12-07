# Snake Duel

````markdown
# Snake Duel

## Quick Start (Run Both Frontend & Backend)

The easiest way to run the entire project is using the root `package.json` script:

```bash
npm run dev
```

This command automatically:
1. Cleans up any existing processes on ports 4000 and 8080
2. Uses **concurrently** to run both the backend and frontend simultaneously
3. Starts with auto-reload enabled for both services

**Service Endpoints:**
- **Backend** runs on `http://localhost:4000` (FastAPI with Uvicorn)
- **Frontend** runs on `http://localhost:8080` (Vite + React)

Both services will start in watch/reload mode, meaning changes to code will automatically reload the applications.

## Manual Cleanup (Optional)

If you need to manually clean up ports without starting the dev server:

```bash
npm run cleanup
```

Or if you want to skip auto-cleanup and run dev directly:

```bash
npm run dev:no-cleanup
```

---

## Individual Setup

### Prerequisites

#### Backend Requirements
- Python 3.8+
- `uv` (dependency manager)

#### Frontend Requirements
- Node.js 18+
- npm (comes with Node.js)

### Setup Backend

1. **Navigate to the backend directory:**
	```bash
	cd backend
	```

2. **Sync dependencies:**
	```bash
	make sync
	```
	Or manually:
	```bash
	uv sync
	```

3. **Run the backend:**
	```bash
	make serve
	```
	The backend will start on `http://localhost:4000` with auto-reload enabled.

**Backend Makefile Commands:**
- `make sync` - Sync dependencies from lockfile
- `make serve` - Run uvicorn with auto-reload (development)
- `make run` - Run the backend directly
- `make test` - Run backend tests

### Setup Frontend

1. **Navigate to the frontend directory:**
	```bash
	cd frontend
	```

2. **Install dependencies:**
	```bash
	npm install
	```

3. **Run the frontend in development mode:**
	```bash
	npm run dev
	```
	The frontend will start on `http://localhost:8080` with Vite's hot module replacement.

**Frontend npm Commands:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

---

## Running in Separate Terminals

If you prefer to run frontend and backend in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
make serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Build for Production

### Build Frontend Only
```bash
npm run frontend:build
```

### Build Entire Project
```bash
npm run build
```

---

## Stopping the Servers

When using `npm run dev`, press `CTRL+C` in the terminal to stop both services.

When running separately, press `CTRL+C` in each terminal.

---

## Running Tests

### Backend Tests

From the backend directory:

```bash
uv run python -m pytest tests/
```

Or using the Makefile:

```bash
cd backend
make test
```

### Frontend Tests

From the frontend directory:

```bash
npm run test
```

---

## Troubleshooting

### Port Already in Use

The most common issue is ports 4000 or 8080 being occupied by previous runs.

**Solution 1: Use the auto-cleanup (Recommended)**
```bash
npm run dev
```
This automatically cleans up any processes using ports 4000 and 8080.

**Solution 2: Manual cleanup**
```bash
npm run cleanup
```

**Solution 3: Manual process killing**
- **Backend (port 4000):**
  ```bash
  lsof -ti:4000 | xargs kill -9
  ```
- **Frontend (port 8080):**
  ```bash
  lsof -ti:8080 | xargs kill -9
  ```

**Solution 4: Check what's using the ports**
```bash
# Check port 4000
lsof -i :4000

# Check port 8080
lsof -i :8080
```

### Backend Dependencies Issues
- Clear cache and reinstall:
  ```bash
  cd backend
  uv sync --refresh
  ```

### Frontend Dependencies Issues
- Clear node_modules and reinstall:
  ```bash
  cd frontend
  rm -rf node_modules
  npm install
  ```

---

## Project Structure

```
snake-duel/
├── backend/              # FastAPI backend server
│   ├── main.py          # Entry point
│   ├── pyproject.toml   # Python dependencies
│   └── Makefile         # Build automation
├── frontend/            # React + Vite frontend
│   ├── src/             # React source code
│   ├── package.json     # Node dependencies
│   └── vite.config.ts   # Vite configuration
└── package.json         # Root scripts (concurrently setup)
```

---

## Technology Stack

- **Backend:** Python, FastAPI, Uvicorn
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Concurrency:** concurrently (npm package for running multiple processes)

## Notes
- All backend code is in `backend/app/`.
- All backend tests are in `backend/tests/`.
- All frontend code is in `frontend/src/`.
- All frontend tests are in `frontend/test/`.
- Ensure `backend/.venv/`, `node_modules/` and DB files are listed in `.gitignore` to avoid committing them.

````
