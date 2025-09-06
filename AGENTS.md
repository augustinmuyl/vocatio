# Repository Guidelines

## Project Structure & Module Organization

- Backend: `backend/app`
  - `api/routes`: FastAPI route handlers
  - `core`: settings, security, utilities
  - `db`: session and database helpers
  - `models`: SQLAlchemy models
  - `schemas`: Pydantic request/response models
  - Migrations: `backend/app/alembic` (versions in `versions/`)
  - Tests: `backend/tests`
- Frontend: `frontend/src`
  - `app`: app-level routing/pages
  - `components/ui`: reusable UI components
  - `lib`: client utilities/helpers
  - Public assets: `frontend/public`

## Build, Test, and Development Commands

- Backend (from `backend/`):
  - `python -m venv .venv && source .venv/bin/activate` — create/activate venv
  - `pip install -r requirements.txt` — install dependencies
  - `uvicorn app.main:app --reload` — run API locally
  - `alembic upgrade head` — run DB migrations
  - `pytest -q` — run backend tests
- Frontend (from `frontend/`):
  - `npm install` — install dependencies
  - `npm run dev` — start local dev server
  - `npm run build && npm run start` — production build + serve
  - `npm test` — run frontend tests

## Coding Style & Naming Conventions

- Python: PEP 8; 4-space indent; type hints required in new code.
  - Format with Black; sort imports with isort; lint with Ruff/Flake8 (if configured).
  - Filenames: `snake_case.py`; classes `PascalCase`; functions/vars `snake_case`.
- TS/JS: 2-space indent; prefer TypeScript in `src/`.
  - Format with Prettier; lint with ESLint (if configured).
  - Components `PascalCase.tsx`; hooks/utilities `camelCase.ts`.

## Testing Guidelines

- Backend: place tests in `backend/tests`, mirror package paths; name `test_*.py`.
  - Aim for ≥80% coverage; use `pytest -q` (add `--cov` if configured).
- Frontend: co-locate `*.test.ts(x)` with components or under `__tests__/`.
  - Use React Testing Library patterns; run with `npm test`.

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`.
  - Example: `feat(api): add organization search endpoint`.
- PRs: concise description, linked issue (`Closes #123`), screenshots for UI, migration notes for DB, and test coverage evidence.

## Security & Configuration Tips

- Never commit secrets. Use `.env` files (`backend/.env`, `frontend/.env.local`).
- Document new env vars in README changes and reference `app/core` for defaults.
