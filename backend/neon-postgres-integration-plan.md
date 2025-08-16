# Plan: Neon Postgres Integration

## Goal

Integrate the existing FastAPI + SQLModel backend with a Neon-hosted Postgres database so that models can be migrated and accessed through the API schemas.

## Background

The backend currently uses SQLModel with a synchronous `psycopg2` driver and reads the database URL from `settings.database_url`. No Alembic migrations are configured yet, and data is not persisted.

## Steps

### 1. Provision Neon database

1. Create a Neon account/project.
2. Create a database and obtain the connection string (ensure `sslmode=require`).
3. Configure roles and password for application access.

### 2. Configure environment

1. Add the Neon connection string to a new `.env` entry `DATABASE_URL`.
2. Ensure `backend/app/core/config.py` reads the `DATABASE_URL` variable (already done via `Settings`).
3. Update documentation and deployment scripts to reference the Neon URL.

### 3. Update database session

1. Modify `backend/app/db/session.py` to use Neon-specific engine options:
   - `create_engine(settings.database_url, pool_pre_ping=True)`.
   - Include `connect_args={"sslmode": "require"}` if needed.
2. Optionally configure SQLModel `engine.echo` via settings for debugging.

### 4. Introduce Alembic migrations

1. Run `alembic init app/alembic` inside `backend` to create migration infrastructure.
2. In `app/alembic/env.py`, import SQLModel metadata: `from app.models import *; target_metadata = SQLModel.metadata`.
3. Configure the script to load `settings.database_url` for the connection string.
4. Generate an initial migration: `alembic revision --autogenerate -m "init"`.
5. Apply migrations to Neon: `alembic upgrade head`.

### 5. Verify models and CRUD operations

1. Create a small script or use existing API routes (`users`, `opportunities`) to:
   - Create records using `UserCreate` and `Opportunity` schemas.
   - Read records back to verify persistence.
2. Add unit tests or integration tests hitting the API to ensure CRUD operations succeed against Neon.

### 6. CI/CD & Deployment

1. Update any deployment workflows to set the `DATABASE_URL` environment variable.
2. Ensure migrations run during deployment (e.g., `alembic upgrade head`).
3. Document local development steps for running against Neon.

## Open Questions

- Do we need asynchronous support (`asyncpg`)?
- How will we seed initial data (use `init_db.py`)?
