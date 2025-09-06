# Waitlist / Interest Form Backend Plan

## Objectives

- Enable students, parents, and organizations to join a waitlist from the existing `Waitlist.tsx` component.
- Persist submissions in the database for future contact and analytics.
- Automatically send a confirmation email on sign‑up. (Future iterations may expand to newsletters.)

## Architecture Overview

1. **Frontend (Existing):** `Waitlist.tsx` collects role‑specific fields and submits them to the backend.
2. **API Layer:** New FastAPI route `POST /api/waitlist` accepts form data, validates it with Pydantic schemas, and stores a record.
3. **Database:** New `waitlist_entries` table stores each submission for later reference.
4. **Email Service:** After storing the entry, backend sends a simple confirmation email (no verification link).

## Database Schema

Create SQLAlchemy model `WaitlistEntry` and corresponding Alembic migration.

| Column | Type | Notes |
|-------|------|-------|
| `id` | UUID / serial PK | unique identifier |
| `role` | Enum(`student`, `parent`, `organization`, `other`) | copied from form |
| `name` | String | required |
| `email` | String | required, unique per role (prevent duplicates) |
| `additional_info` | Text | optional |
| `consent` | Boolean | must be true |
| `created_at` | DateTime | auto timestamp |

### Tasks

- Add SQLAlchemy model `models/waitlist.py`.
- Add Pydantic schemas in `schemas/waitlist_schema.py` for create/response.
- Generate Alembic migration for the new table.
- Update `app/models/__init__.py` and `app/schemas/__init__.py` if needed.

## API Endpoints

### `POST /api/waitlist`

- **Input:** `WaitlistCreate` schema mirroring form fields.
- **Process:**
  1. Validate data.
  2. Insert record into the database.
  3. Queue a confirmation email (background task).
- **Output:** generic success message.

## Email Service

- Provider: Postmark via the direct HTTP API (using `httpx`). Configure credentials (`POSTMARK_API_TOKEN`, `POSTMARK_FROM_EMAIL`) via `app/core/config.py`.
- Implement utility module `core/email.py` with a function `send_confirmation_email`.
- Use FastAPI's `BackgroundTasks` for asynchronous sending.
- Email templates stored in `backend/app/templates/` using Jinja2 for customization.

## Frontend Integration (`Waitlist.tsx`)

- Replace current `onSubmit` console log with POST request to `/api/waitlist` using `fetch` or a typed client.
- Display success/error toast or message.
- Optionally disable the form after successful submission.
- Handle loading state while request is pending.

## Future Enhancements

- Add email verification and unsubscribe flow when evolving to a full mailing list.
- Build admin utilities for exporting entries and sending campaigns.

## Additional Considerations

- **Validation & Security:**
  - Use rate limiting or CAPTCHA to prevent spam.
  - Sanitize text inputs (org_opportunities, etc.).
  - Verify email uniqueness to avoid duplicates.
- **Error Handling:** Provide meaningful error responses for the frontend.
- **Privacy:** Store only necessary data; include privacy statement and ability to delete entries.
- **Testing:** Add unit tests for schema validation and email sending (mocked).

## Implementation Steps Summary

1. Design database model and generate migration.
2. Implement Pydantic schemas.
3. Create API routes (`waitlist.py`) and include them in main router.
4. Build email utility, confirmation template, and configure provider credentials.
5. Modify `Waitlist.tsx` to POST to backend and handle responses.
6. Write unit tests for the new route and email flow.
7. Update documentation/README with setup instructions and environment variables.
