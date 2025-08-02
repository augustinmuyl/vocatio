# Voluntier

Voluntier is a full-stack web application that helps students discover, track, and engage with community service opportunities (mostly with high school community-hours requirements in mind).

> This project is under active development. Many features are still being implemented.

## Spec

### Pre-MVP

- [ ] Landing page
- [ ] Interest form / waitlist for orgs & students
- [ ] Set up analytics

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

## [Logo] VOLUNTIER

---

[Sticky Navbar]
| Home | How It Works | For Students & Parents | For Organizations | Join Waitlist |

---

### HERO SECTION

[Large Headline]
Graduate. Earn Scholarships. Track Community Hours.

[Subheading]
The easiest way for students and families to discover, track, and complete *official* community service hours for graduation, Bright Futures, and more.

[Main CTA Button]
[Join the Waitlist]

[Optional: Small secondary CTA]
[How It Works] (scrolls down)

---

### ABOUT / VALUE PROP

[Section Title]
Why Voluntier?

[Short Description]
Voluntier is the only platform focused on helping high school students—and their parents—find *verified* community service opportunities that count towards graduation, state scholarships, and college applications.  
No more spreadsheet chaos, confusing paperwork, or missing out on your diploma or Bright Futures. Everything you need, in one place.

---

### HOW IT WORKS / FEATURES

[Section Title]
How Voluntier Works

[Feature Cards/Stack]
---------------------------------------------------
| 🔍  | Search real, approved community service opportunities in your area  |
---------------------------------------------------
| 📋  | See exactly how many *official* hours are offered per activity      |
---------------------------------------------------
| 🏅  | Track your hours and automatically see progress toward major milestones: Graduation (X hours), Bright Futures (100h), Honor Cords (250/500/1000h)   |
---------------------------------------------------
| 📑  | Download reports and documentation for your school                  |
---------------------------------------------------
| 👨‍👩‍👧  | For parents: Find approved opportunities and track required family hours |
---------------------------------------------------
| 🤝  | For organizations: Easily list your approved hours and reach local students |
---------------------------------------------------

[Highlight “Official”, “Approved”, “Counts for Graduation” throughout]

---

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

### GENERAL WAITLIST FORM

[Section Title]
Get Early Access

[Form fields:]
- Name
- Email
- I am a: [Student / Parent / Organization / Other] (radio buttons)
  - If "Organization" selected:
    - Organization Name
    - Role/Position
    - What type of opportunities/hours do you offer?
  - If "Student" or "Parent" selected:
    - School or School District (optional)
    - Which requirement matters most to you? [Graduation / Bright Futures / Honor Cord / Other]
    - How many hours do you still need? (optional)
- [Submit Button]

[Small privacy note]
“We’ll only contact you about early access and your interest in Voluntier. No spam, ever.”

---

### FOOTER

[Links: Contact Email] | [Privacy Policy] | [Socials (optional)]
© 2025 Voluntier. All rights reserved.

---
