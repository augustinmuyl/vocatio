from fastapi import FastAPI

from app.api.routes import test

app = FastAPI()

app.include_router(test.router)
