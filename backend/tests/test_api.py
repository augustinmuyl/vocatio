import os
import sys
from pathlib import Path
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel

sys.path.append(str(Path(__file__).resolve().parents[1]))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["FRONTEND_URL"] = "http://testserver"

from app.db.session import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Account, AccountKind, Opportunity, Organization  # noqa: E402


@pytest.fixture(autouse=True)
def prepare_database():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


client = TestClient(app)


# Removed user CRUD tests as legacy /users routes were deleted


def test_opportunity_crud():
    # Create an org account + organization directly in the DB
    with Session(engine) as session:
        acct = Account(email="org@example.com", hashed_password="x", kind=AccountKind.ORG)
        session.add(acct)
        session.commit()
        session.refresh(acct)
        org = Organization(account_id=acct.id, name="Org", slug="org")
        session.add(org)
        session.commit()
        org_id = str(acct.id)

    opp_payload = {
        "org_id": org_id,
        "title": "Beach Cleanup",
        "description": "Help clean the beach",
        # leave community_hours out to test derivation: 9am-2pm = 5h
        "start_at": "2024-01-01T09:00:00Z",
        "end_at": "2024-01-01T14:00:00Z",
        "timezone": "America/New_York",
        "location": "MIAMI",
        "address": "123 Beach Ave",
        "zip_code": "33101",
        "themes": ["ENVIRONMENT"],
        "is_active": True,
    }
    opp_resp = client.post("/opportunities", json=opp_payload)
    assert opp_resp.status_code == 200
    opp_id = opp_resp.json()["id"]

    get_resp = client.get(f"/opportunities/{opp_id}")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["title"] == opp_payload["title"]
    assert data["community_hours"] == 5
    assert data["location"] == "MIAMI"


def test_opportunity_requires_address_for_non_remote():
    # Create org directly in the DB
    with Session(engine) as session:
        acct = Account(email="org2@example.com", hashed_password="x", kind=AccountKind.ORG)
        session.add(acct)
        session.commit()
        session.refresh(acct)
        org = Organization(account_id=acct.id, name="Org2", slug="org2")
        session.add(org)
        session.commit()
        org_id = str(acct.id)

    # missing address for MIAMI should fail validation
    opp_payload = {
        "org_id": org_id,
        "title": "Park Cleanup",
        "description": "Help clean the park",
        "start_at": "2024-02-01T09:00:00Z",
        "end_at": "2024-02-01T12:00:00Z",
        "timezone": "America/New_York",
        "location": "MIAMI",
        "zip_code": "33101",
        "is_active": True,
    }
    resp = client.post("/opportunities", json=opp_payload)
    assert resp.status_code == 422


def test_opportunity_end_before_start_invalid():
    # Create org directly in the DB
    with Session(engine) as session:
        acct = Account(email="org3@example.com", hashed_password="x", kind=AccountKind.ORG)
        session.add(acct)
        session.commit()
        session.refresh(acct)
        org = Organization(account_id=acct.id, name="Org3", slug="org3")
        session.add(org)
        session.commit()
        org_id = str(acct.id)

    opp_payload = {
        "org_id": org_id,
        "title": "Food Drive",
        "description": "Help collect food",
        "start_at": "2024-03-01T12:00:00Z",
        "end_at": "2024-03-01T10:00:00Z",
        "timezone": "America/New_York",
        "location": "REMOTE",
        "is_active": True,
    }
    resp = client.post("/opportunities", json=opp_payload)
    assert resp.status_code == 422


def test_opportunity_slug_collision_suffix():
    with Session(engine) as session:
        acct = Account(email="org4@example.com", hashed_password="x", kind=AccountKind.ORG)
        session.add(acct)
        session.commit()
        session.refresh(acct)
        org = Organization(account_id=acct.id, name="Org4", slug="org4")
        session.add(org)
        session.commit()
        org_id = str(acct.id)

    base_payload = {
        "org_id": org_id,
        "title": "Community Garden Day",
        "description": "Plant and maintain a garden",
        "start_at": "2024-04-01T09:00:00Z",
        "end_at": "2024-04-01T11:00:00Z",
        "timezone": "America/New_York",
        "location": "NYC",
        "address": "1 Main St",
        "zip_code": "10001",
        "is_active": True,
    }

    r1 = client.post("/opportunities", json=base_payload)
    assert r1.status_code == 200
    s1 = r1.json()["slug"]

    r2 = client.post("/opportunities", json=base_payload)
    assert r2.status_code == 200
    s2 = r2.json()["slug"]

    assert s1 != s2
    assert s2.startswith(s1 + "-") or s2.endswith("-1")


def test_waitlist_signup():
    payload = {
        "role": "student",
        "name": "Bob",
        "email": "bob@example.com",
        "additional_info": "Looking for volunteering",
        "consent": True,
        "website": "",
    }
    resp = client.post("/waitlist", json=payload)
    assert resp.status_code == 200
    assert resp.json()["message"] == "Waitlist entry created"

    resp_dup = client.post("/waitlist", json=payload)
    assert resp_dup.status_code == 409

    diff_role_payload = {**payload, "role": "parent"}
    resp_diff_role = client.post("/waitlist", json=diff_role_payload)
    assert resp_diff_role.status_code == 409

    bot_payload = {**payload, "email": "bot@example.com", "website": "spam"}
    resp_bot = client.post("/waitlist", json=bot_payload)
    assert resp_bot.status_code == 400


def _create_org(name: str, slug: str, email: str) -> str:
    with Session(engine) as session:
        acct = Account(email=email, hashed_password="x", kind=AccountKind.ORG)
        session.add(acct)
        session.commit()
        session.refresh(acct)
        org = Organization(account_id=acct.id, name=name, slug=slug)
        session.add(org)
        session.commit()
        return str(acct.id)


def test_list_opportunities_with_filters_and_pagination():
    org_id = _create_org(name="OrgList", slug="orglist", email="orglist@example.com")

    created_ids: list[str] = []
    created_slugs: list[str] = []

    for i in range(14):
        location = ["REMOTE", "MIAMI", "NYC"][i % 3]
        themes = ["ENVIRONMENT"] if i % 2 == 0 else ["EDUCATION"]
        payload = {
            "org_id": org_id,
            "title": f"Opportunity {i}",
            "description": "Help out",
            "start_at": "2024-05-01T09:00:00Z",
            "end_at": "2024-05-01T12:00:00Z",
            "timezone": "America/New_York",
            "location": location,
            "themes": themes,
            "is_active": True,
        }

        if location != "REMOTE":
            payload["address"] = f"{i} Example St"
            payload["zip_code"] = "10001" if location == "NYC" else "33101"

        resp = client.post("/opportunities", json=payload)
        assert resp.status_code == 200
        body = resp.json()
        created_ids.append(body["id"])
        created_slugs.append(body["slug"])

    inactive_id = created_ids[0]
    with Session(engine) as session:
        opp = session.get(Opportunity, UUID(inactive_id))
        assert opp is not None
        opp.is_active = False
        session.add(opp)
        session.commit()

    list_resp = client.get("/opportunities")
    assert list_resp.status_code == 200
    payload = list_resp.json()
    assert payload["page"] == 1
    assert payload["page_size"] == 12
    assert payload["total"] == 13
    assert payload["has_next"] is True
    assert len(payload["items"]) == 12
    ids = {item["id"] for item in payload["items"]}
    assert inactive_id not in ids

    # page 2 should include the remaining active item
    second_page = client.get("/opportunities", params={"page": 2})
    assert second_page.status_code == 200
    page_data = second_page.json()
    assert page_data["page"] == 2
    assert len(page_data["items"]) == 1

    miami_resp = client.get("/opportunities", params={"locations": "MIAMI"})
    assert miami_resp.status_code == 200
    miami_items = miami_resp.json()["items"]
    assert miami_items
    assert all(item["location"] == "MIAMI" for item in miami_items)

    theme_resp = client.get("/opportunities", params={"themes": "ENVIRONMENT"})
    assert theme_resp.status_code == 200
    theme_items = theme_resp.json()["items"]
    assert theme_items
    assert all("ENVIRONMENT" in item.get("themes", []) for item in theme_items)

    # slug lookup should succeed for an active opportunity
    active_slug = next(slug for idx, slug in zip(created_ids, created_slugs, strict=False) if idx != inactive_id)
    slug_resp = client.get(f"/opportunities/slug/{active_slug}")
    assert slug_resp.status_code == 200
    assert slug_resp.json()["slug"] == active_slug

    # inactive opportunities should no longer be retrievable
    inactive_detail = client.get(f"/opportunities/{inactive_id}")
    assert inactive_detail.status_code == 404
