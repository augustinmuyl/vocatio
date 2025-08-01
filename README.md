# Voluntier

Voluntier is a full-stack web application that helps students discover, track, and engage with community service opportunities (mostly with high school community-hours requirements in mind).

> This project is under active development. Many features are still being implemented.

## Spec

### MVP (v0.1.0)

- User browse opportunities
  - Details page (contact, sign up)
  - Filter by:
    - Location
    - Theme
    - Community hours
  - *Lazy loading and/or pagination ?*
  - *Search bar ?*
- Basic org page
- Interest form / waitlist for orgs
- Set up analytics

### v0.2.0

- Org sign up / login
- Org opportunity posting
- *User login ? (all opportunities not visible by default)*
  - Maybe not a good idea

### v0.3.0

- User profile
- Community hour / completed opportunities tracking

### v0.4.0+

- Gamification, leaderboards, reward tiers, etc.
- Direct user/org messaging
- Verification systems, etc.

## Project Structure

```text
.
├── backend
│   └── app
│       ├── api
│       │   └── routes
│       ├── core
│       ├── db
│       ├── models
│       └── schemas
└── frontend
    ├── public
    └── src
        └── app
```
