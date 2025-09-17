# Vocatio

[![Status](https://img.shields.io/badge/status-active_development-orange)](#)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Dockerized](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Pytest](https://img.shields.io/badge/Pytest-tested-0A9EDC?logo=pytest&logoColor=white)](https://docs.pytest.org/)

Vocatio is a full-stack web application that helps students discover, track, and engage with community service opportunities (with high-school community-hours requirements in mind).

Note: This project is under active development. Many features are still being implemented.

## Tech Stack

- Backend: FastAPI, SQLModel, Alembic, PostgreSQL (SQLite supported for local dev)
- Frontend: Next.js (App Router), React 19, Tailwind-based UI
- Infra/Dev: Docker Compose, Ruff, Pytest

## Project Structure

```text
.
├── backend
│   ├── app
│   │   ├── alembic
│   │   │   └── versions
│   │   ├── api
│   │   │   └── routes
│   │   ├── core
│   │   ├── db
│   │   ├── models
│   │   └── schemas
│   └── tests
└── frontend
    ├── public
    └── src
        ├── app
        ├── components
        │   └── ui
        └── lib
```

## Quick Start (Local)

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (optional, for containerized dev/prod-like)

### Backend

1) Configure environment (create `backend/.env`):

```env
# Quickstart (SQLite) — local only
DATABASE_URL=sqlite:///./dev.db
DATABASE_ECHO=false

# CORS origin for the web app
FRONTEND_URL=http://localhost:3000

# Optional — enable email confirmations via Postmark
POSTMARK_API_TOKEN=
POSTMARK_FROM_EMAIL=
```

2) Install and run the API:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

The API serves OpenAPI docs at http://127.0.0.1:8000/docs

### Frontend

1) Configure environment (create `frontend/.env`):

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

2) Install and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

The app runs at http://localhost:3000

## Docker

Run the stack either in dev (hot reload) or prod-like mode.

### Dev (hot reload)

- Start: `docker compose up`
- Frontend dev server: http://localhost:3000
- API with reload: http://localhost:8000

Details:
- Backend runs `uvicorn --reload` and mounts `backend/app` for live code reload.
- Frontend runs `next dev` and mounts `frontend/` so edits reflect instantly.
- Env files:
  - Backend uses `backend/.env`.
  - Frontend uses `frontend/.env`.

### Prod-like (local)

- Build and start: `docker compose -f docker-compose.prod.yml up --build`
- Frontend (built): http://localhost:3000
- API: http://localhost:8000

Notes:
- The backend reads environment from `backend/.env` via `env_file`.
- The frontend build ARG/ENV `NEXT_PUBLIC_BACKEND_URL` must point to the API URL.

## Environment Variables

Backend (`backend/.env`):
- `DATABASE_URL` (required) — Postgres recommended in production, e.g. `postgresql+psycopg2://user:pass@host/db?sslmode=require`. For local quickstart, use `sqlite:///./dev.db`.
- `DATABASE_ECHO` (optional, default `false`) — SQL logging.
- `FRONTEND_URL` (required) — Allowed CORS origin, e.g. `http://localhost:3000`.
- `POSTMARK_API_TOKEN` (optional) — Enables confirmation emails when set.
- `POSTMARK_FROM_EMAIL` (optional) — From address for Postmark emails.

Frontend (`frontend/.env`):
- `NEXT_PUBLIC_BACKEND_URL` (required) — Base URL for the API, e.g. `http://127.0.0.1:8000`.

Security tip: do not commit real secrets. Prefer `.env` files kept out of version control and managed via secret stores in deployment.

## Database & Migrations

- Configure `DATABASE_URL` in `backend/.env`.
- Create/update schema: `alembic upgrade head`.
- Alembic reads the URL from settings at runtime; no manual `sqlalchemy.url` editing needed.

Migrations policy
- Alembic migrations are PostgreSQL-only. Running Alembic against SQLite will raise a clear error by design.
- Tests use an in-memory SQLite database and initialize schema via `SQLModel.metadata.create_all(engine)` — migrations are not executed in tests.
- This avoids dialect drift and lets us use Postgres-native features (enums, JSONB, GIN indexes) without branching in migrations.

SQLite is supported for local development and tests; PostgreSQL is recommended and used in production. The engine auto-configures sensible defaults (e.g., SSL for Postgres, thread checks for SQLite).

## Opportunity Imports

- Run CSV imports via `python -m app.cli import-opportunities <csv_path>` from the `backend/` directory (venv activated). Runs are dry-run by default; append `--apply` when you’re ready to persist changes. A starter template lives at `backend/data/opportunities_template.csv`.
- Required columns: `title`, `description`, `start_at`, `end_at`, `location`, and either `org_id` (UUID) or `org_slug`.
- Optional columns: `timezone`, `address`, `zip_code`, `themes`, `community_hours`, `signup_url`, `is_active`.
- `themes` accepts a `;`-delimited list of enum values (e.g., `COMMUNITY_SERVICE;ENVIRONMENT`). Locations and themes are case-insensitive; values are upper-cased before validation.
- Use ISO-8601 timestamps with timezone information (e.g., `2024-05-01T10:00:00Z`). `is_active` accepts `true/false`, `yes/no`, or `1/0`.
- The command enforces schema validation, derives missing community hours, generates unique slugs, and aborts on the first error unless `--continue-on-error` is specified. Add `--dry-run` to preview errors without persisting changes.

Example CSV:

```csv
org_slug,org_id,title,description,start_at,end_at,location,timezone,address,zip_code,themes,community_hours,signup_url,is_active
org-abc,,Park Cleanup,Help beautify the park,2024-06-01T09:00:00Z,2024-06-01T12:00:00Z,NYC,America/New_York,123 Main St,10001,ENVIRONMENT;COMMUNITY_SERVICE,,https://example.org/apply,true
,9f2d4433-bc86-4f5e-9d8f-7ff8e2c96187,Remote Tutoring,Virtual homework help,2024-06-05T15:00:00Z,2024-06-05T17:00:00Z,REMOTE,America/Chicago,,,,STEM,,,
```

## API Overview

- Docs/Playground: http://127.0.0.1:8000/docs

Waitlist submission
- Endpoint: `POST /waitlist`
- Example payload:

```json
{
  "role": "student",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "additional_info": "Interested in tutoring",
  "consent": true,
  "website": null
}
```

If Postmark credentials are configured, a confirmation email is sent asynchronously. Duplicate emails return HTTP 409.

## Testing & Linting

- Backend tests: `cd backend && pytest -q`
- Lint (Ruff): `ruff check backend/app` and `ruff format backend/app`
- Frontend: no tests are defined yet; run lint via `npm run lint`.

## Contributing

- Use Conventional Commits, e.g., `feat(api): add waitlist endpoint`.
- Open PRs with a concise description, link issues (e.g., `Closes #123`), and include screenshots for UI changes. Mention DB migration notes where applicable.
- Code style: Python (PEP 8, type hints; Ruff for lint/format). TypeScript (2-space indent; Prettier/ESLint if configured).

## Deployment

- Use the prod-like compose file for local validation: `docker compose -f docker-compose.prod.yml up --build`.
- Ensure all required env vars are provided. Run `alembic upgrade head` against the production database before serving traffic.

## Spec

### Pre-MVP

- [x] Landing page
- [x] Interest form / waitlist for orgs & students
- [ ] Set up analytics (kinda done?)

### MVP (v0.1.0)

- [ ] User browse opportunities
  - [ ] Details page (contact, sign up)
  - [ ] Filter by:
    - [ ] Location
    - [ ] Theme
    - [ ] Community hours
  - [ ] *Lazy loading and/or pagination ?*
  - [ ] *Search bar ?*
- [ ] Basic org page

### v0.2.0

- [ ] Org sign up / login
- [ ] Org opportunity posting
- [ ] *User login ? (all opportunities not visible by default)*
  - [ ] Maybe not a good idea

### v0.3.0

- [ ] User profile
- [ ] Community hour / completed opportunities tracking

### v0.4.0+

- [ ] Gamification, leaderboards, reward tiers, etc.
- [ ] Direct user/org messaging
- [ ] Verification systems, etc.
