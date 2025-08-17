import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel

sys.path.append(str(Path(__file__).resolve().parents[1]))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.db.session import engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def prepare_database():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


client = TestClient(app)


def test_user_crud():
    payload = {
        "name": "Alice",
        "email": "alice@example.com",
        "password": "password123",
        "role": "STUDENT",
    }
    resp = client.post("/users", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    user_id = data["id"]

    get_resp = client.get(f"/users/{user_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["email"] == payload["email"]


def test_opportunity_crud():
    user_payload = {
        "name": "Org",
        "email": "org@example.com",
        "password": "password123",
        "role": "ORG",
    }
    user_resp = client.post("/users", json=user_payload)
    org_id = user_resp.json()["id"]

    opp_payload = {
        "org_id": org_id,
        "title": "Beach Cleanup",
        "description": "Help clean the beach",
        "community_hours": 5,
        "event_date": "2024-01-01T00:00:00",
        "address": "123 Beach Ave",
        "city": "Miami",
        "state": "FL",
        "zip_code": "33101",
        "is_active": True,
    }
    opp_resp = client.post("/opportunities", json=opp_payload)
    assert opp_resp.status_code == 200
    opp_id = opp_resp.json()["id"]

    get_resp = client.get(f"/opportunities/{opp_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == opp_payload["title"]


def test_waitlist_signup():
    payload = {
        "role": "student",
        "name": "Bob",
        "email": "bob@example.com",
        "school": "Central High",
        "requirement": "graduation",
        "hours_needed": 40,
    }
    resp = client.post("/waitlist", json=payload)
    assert resp.status_code == 200
    assert resp.json()["message"] == "Waitlist entry created"

    resp_dup = client.post("/waitlist", json=payload)
    assert resp_dup.status_code == 409

