# Voluntier

## Project Structure

```
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   │       ├── users.py
│   │       └── opportunities.py
│   ├── models/
│   │   ├── user.py
│   │   └── opportunity.py
│   ├── schemas/
│   │   ├── user_schema.py
│   │   └── opportunity_schema.py
│   ├── db/
│   │   ├── session.py
│   │   └── init_db.py
│   └── core/
│       ├── config.py
│       └── security.py
├── .env
└── requirements.txt
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
├── public/
│   └── assets/
└── .env
```

