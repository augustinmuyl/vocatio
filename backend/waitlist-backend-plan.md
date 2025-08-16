# Waitlist / Interest Form Backend Plan

## Objectives

- Enable students, parents, and organizations to join a waitlist from the existing `Waitlist.tsx` component.
- Persist submissions in the database for future contact and analytics.
- Automatically send confirmation emails on sign‑up and allow future email campaigns.
- Provide a backend foundation for an admin to manage entries and communicate with subscribers.

## Architecture Overview

1. **Frontend (Existing):** `Waitlist.tsx` collects role‑specific fields and submits them to the backend.
2. **API Layer:** New FastAPI route `POST /api/waitlist` accepts form data, validates it with Pydantic schemas, and stores a record.
3. **Database:** New `waitlist_entries` table stores each submission along with confirmation status and metadata.
4. **Email Service:** After storing the entry, backend sends a confirmation email containing a unique verification link.
5. **Email Confirmation Endpoint:** `GET /api/waitlist/confirm?token=...` marks the entry as confirmed when the link is visited.
6. **Admin/Follow‑up:** Dedicated route or management script allows administrators to query the waitlist and send follow‑up emails.

## Database Schema

Create SQLAlchemy model `WaitlistEntry` and corresponding Alembic migration.

| Column | Type | Notes |
|-------|------|-------|
| `id` | UUID / serial PK | unique identifier |
| `role` | Enum(`student`, `parent`, `organization`, `other`) | copied from form |
| `name` | String | required |
| `email` | String | required, unique per role (prevent duplicates) |
| `school` | String | optional |
| `requirement` | Enum(`graduation`, `bright_futures`, `honor_cord`, `other`) | optional except for student/parent |
| `hours_needed` | Integer | optional |
| `org_name` | String | required for organizations |
| `org_role` | String | required for organizations |
| `org_opportunities` | Text | required for organizations |
| `confirmed` | Boolean | default `False`; set `True` after email verification |
| `confirmation_token` | String | random token sent in confirmation link |
| `unsubscribed` | Boolean | default `False`; updated when user opts out |
| `created_at` | DateTime | auto timestamp |

### Tasks

- Add SQLAlchemy model `models/waitlist.py`.
- Add Pydantic schemas in `schemas/waitlist_schema.py` for create/response/confirmation.
- Generate Alembic migration for the new table.
- Update `app/models/__init__.py` and `app/schemas/__init__.py` if needed.

## API Endpoints

### `POST /api/waitlist`

- **Input:** `WaitlistCreate` schema mirroring form fields.
- **Process:**
  1. Validate data.
  2. Generate `confirmation_token`.
  3. Insert record with `confirmed=False`.
  4. Queue a confirmation email (background task).
- **Output:** generic success message.

### `GET /api/waitlist/confirm`

- **Query Parameter:** `token`.
- **Process:**
  1. Look up entry by token.
  2. If found and not already confirmed, set `confirmed=True` and clear token.
  3. Optional: send a "Welcome"/"You are confirmed" email.
- **Output:** simple HTML or redirect to frontend page.

### `GET /api/waitlist` (admin only)

- List entries, filter by role/confirmation status, or export emails.
- Authentication via existing user/admin system or environment‑protected route.

### `POST /api/waitlist/email` (admin only)

- Accepts a message and list/filter of recipients; sends bulk email via the email service.
- Consider using background tasks or an async queue for scalability.

## Email Service

- Choose provider: SendGrid, Mailgun, AWS SES, etc. Configure credentials via `app/core/config.py`.
- Implement utility module `core/email.py` with functions `send_confirmation_email`, `send_bulk_email`.
- Use FastAPI's `BackgroundTasks` or Celery for asynchronous sending.
- Email templates stored in `backend/app/templates/` using Jinja2 for customization.
- Confirmation email includes link: `https://<frontend-domain>/api/waitlist/confirm?token=<token>`.
- Provide unsubscribe link in follow‑up emails (`/api/waitlist/unsubscribe?token=...`).

## Frontend Integration (`Waitlist.tsx`)

- Replace current `onSubmit` console log with POST request to `/api/waitlist` using `fetch` or a typed client.
- Display success/error toast or message.
- Optionally disable the form after successful submission.
- Handle loading state while request is pending.

## Administration & Follow‑up Emails

- Build a simple CLI or admin route to:
  - Export waitlist entries (CSV or JSON).
  - Filter by role or confirmation status.
  - Trigger `POST /api/waitlist/email` for targeted updates or product announcements.
- Include rate‑limiting or throttling to prevent accidental mass emails.

## Additional Considerations

- **Validation & Security:**
  - Use rate limiting or CAPTCHA to prevent spam.
  - Sanitize text inputs (org_opportunities, etc.).
  - Verify email uniqueness to avoid duplicates.
- **Error Handling:** Provide meaningful error responses for the frontend.
- **Privacy:** Store only necessary data; include privacy statement and ability to delete entries.
- **Testing:** Add unit tests for schema validation, email sending (mocked), and confirmation flow.

## Implementation Steps Summary

1. Design database model and generate migration.
2. Implement Pydantic schemas.
3. Create API routes (`waitlist.py`) and include them in main router.
4. Build email utility and configure provider credentials.
5. Modify `Waitlist.tsx` to POST to backend and handle responses.
6. Add confirmation template and endpoint logic.
7. Create admin utilities for listing and emailing waitlist entries.
8. Write unit tests for new routes and email flow.
9. Update documentation/README with setup instructions and environment variables.
