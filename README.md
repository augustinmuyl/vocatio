# Vocatio

Vocatio is a full-stack web application that helps students discover, track, and engage with community service opportunities (mostly with high school community-hours requirements in mind).

> This project is under active development. Many features are still being implemented.

## Getting Started

Set up the project locally to contribute:

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and the API at `http://127.0.0.1:8000`.
Run backend tests with `pytest` and frontend tests with `npm test`.

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

## Backend Email Configuration

Set the following environment variables to enable Postmark-powered confirmation emails:

- `POSTMARK_API_TOKEN`
- `POSTMARK_FROM_EMAIL`

## Skeleton

### DEMO / PREVIEW SECTION (Optional)

[Section Title]
A Sneak Peek

[Image Carousel or Placeholder Screenshot: Hour tracker, milestones, official-looking opportunities]

---

### FOR STUDENTS & PARENTS

[Section Title]
For Students & Parents

[Blurb]
Never miss a deadline or scholarship because of missing hours.
- Browse a curated list of *officially recognized* service activities
- Track your progress toward graduation and scholarships in real-time
- Download records and verification forms when you need them
- Discover unique, high-hour opportunities before your friends

---

### FOR ORGANIZATIONS

[Section Title]
For Organizations

[Blurb]
Easily connect with local students and families seeking *official* community service hours.
- List your opportunities for free
- Specify how many *approved* hours are offered
- Help students graduate and win scholarships

---
