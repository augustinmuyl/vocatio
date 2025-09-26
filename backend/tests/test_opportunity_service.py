import os
import sys
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlmodel import Session, SQLModel

sys.path.append(str(Path(__file__).resolve().parents[1]))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ.setdefault("FRONTEND_URL", "http://testserver")

from app.db.session import engine
from app.models import Account, AccountKind, Organization
from app.models.opportunity import Location, Theme
from app.schemas.opportunity_schema import OpportunityCreate, OpportunityUpdate
from app.services.opportunity_service import (
    create_opportunity,
    list_opportunities,
    update_opportunity,
)


@pytest.fixture(autouse=True)
def prepare_database():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


def _create_org(session: Session, *, email: str, slug: str) -> Organization:
    account = Account(email=email, hashed_password="x", kind=AccountKind.ORG)
    session.add(account)
    session.commit()
    session.refresh(account)

    org = Organization(account_id=account.id, name=slug.title(), slug=slug)
    session.add(org)
    session.commit()
    session.refresh(org)
    return org


def _aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


def test_create_opportunity_minimum_hours():
    with Session(engine) as session:
        org = _create_org(session, email="a@example.com", slug="org-a")

        payload = OpportunityCreate(
            org_id=org.account_id,
            title="Short Event",
            description="30 minute volunteer shift",
            start_at=_aware(datetime(2024, 1, 1, 10, 0)),
            end_at=_aware(datetime(2024, 1, 1, 10, 30)),
            location=Location.REMOTE,
        )

        opportunity = create_opportunity(session, payload)

        assert opportunity.community_hours == 1


def test_update_opportunity_recalculates_hours_and_checks_address():
    with Session(engine) as session:
        org = _create_org(session, email="b@example.com", slug="org-b")

        create_payload = OpportunityCreate(
            org_id=org.account_id,
            title="Coding Marathon",
            description="Help students code",
            start_at=_aware(datetime(2024, 1, 1, 9, 0)),
            end_at=_aware(datetime(2024, 1, 1, 12, 0)),
            location=Location.REMOTE,
        )

        opportunity = create_opportunity(session, create_payload)

        update_payload = OpportunityUpdate(
            end_at=_aware(datetime(2024, 1, 1, 9, 45)),
        )

        updated = update_opportunity(session, opportunity, update_payload)
        assert updated.community_hours == 1

        with pytest.raises(ValueError):
            update_opportunity(session, updated, OpportunityUpdate(location=Location.NYC))


def test_timezone_validation():
    with pytest.raises(ValidationError):
        OpportunityCreate(
            org_id=uuid4(),
            title="Invalid TZ",
            description="Test",
            start_at=_aware(datetime(2024, 1, 1, 9, 0)),
            end_at=_aware(datetime(2024, 1, 1, 10, 0)),
            location=Location.REMOTE,
            timezone="Mars/Phobos",
        )

    with pytest.raises(ValidationError):
        OpportunityUpdate(timezone="Mars/Phobos")


def test_list_opportunities_filters_by_theme():
    with Session(engine) as session:
        org = _create_org(session, email="c@example.com", slug="org-c")

        common_kwargs = dict(
            org_id=org.account_id,
            description="Testing filters",
            start_at=_aware(datetime(2024, 1, 1, 10, 0)),
            end_at=_aware(datetime(2024, 1, 1, 12, 0)),
            location=Location.REMOTE,
        )

        first = create_opportunity(
            session,
            OpportunityCreate(
                title="STEM Opportunity",
                themes=[Theme.STEM],
                **common_kwargs,
            ),
        )

        create_opportunity(
            session,
            OpportunityCreate(
                title="Arts Opportunity",
                themes=[Theme.ARTS],
                **common_kwargs,
            ),
        )

        items, total = list_opportunities(
            session,
            page=1,
            page_size=10,
            themes=[Theme.STEM],
            locations=None,
        )

        assert total == 1
        assert len(items) == 1
        assert items[0].id == first.id


def test_list_opportunities_filters_by_search():
    with Session(engine) as session:
        org = _create_org(session, email="search@example.com", slug="search-org")

        common_kwargs = dict(
            org_id=org.account_id,
            start_at=_aware(datetime(2024, 6, 1, 9, 0)),
            end_at=_aware(datetime(2024, 6, 1, 12, 0)),
            location=Location.REMOTE,
            themes=[Theme.COMMUNITY_SERVICE],
        )

        cleanup = create_opportunity(
            session,
            OpportunityCreate(
                title="Neighborhood Cleanup",
                description="Join us to clean the park",
                **common_kwargs,
            ),
        )

        families = create_opportunity(
            session,
            OpportunityCreate(
                title="Support Families",
                description="FAMILIES gather for tutoring support",
                **common_kwargs,
            ),
        )

        create_opportunity(
            session,
            OpportunityCreate(
                title="Food Pantry Help",
                description="Organize donations",
                **common_kwargs,
            ),
        )

        items, total = list_opportunities(
            session,
            page=1,
            page_size=10,
            search="cleanup",
        )

        assert total == 1
        assert len(items) == 1
        assert items[0].id == cleanup.id

        items, total = list_opportunities(
            session,
            page=1,
            page_size=10,
            search="  families  ",
        )

        assert total == 1
        assert len(items) == 1
        assert items[0].id == families.id

