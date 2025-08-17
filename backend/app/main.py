from fastapi import FastAPI

from app.api.routes import opportunities, test, users, waitlist

app = FastAPI()

app.include_router(test.router)
app.include_router(users.router)
app.include_router(opportunities.router)
app.include_router(waitlist.router)
