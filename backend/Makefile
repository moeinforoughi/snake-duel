PY=uv run python
UV=uv run

.PHONY: help sync run serve test

help:
	@echo "Makefile for backend (Snake Duel)"
	@echo "Usage:"
	@echo "  make sync         # sync dependencies from lockfile (uses uv)"
	@echo "  make run          # run backend via uv (runs main.py)"
	@echo "  make serve        # run uvicorn with reload (for development)"
	@echo "  make test         # run backend tests (if any)"

sync:
	@echo "Syncing dependencies with uv..."
	$(UV) sync

run:
	@echo "Running backend (main.py)"
	$(PY) main.py

serve:
	@echo "Starting uvicorn with --reload on port 4000"
	$(PY) -m uvicorn main:app --reload --host 0.0.0.0 --port 4000

test:
	@echo "Running tests with SQLite in-memory database"
	DATABASE_URL="sqlite:///:memory:" $(PY) -m pytest -q
