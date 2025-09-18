import csv
import os
import sys
from pathlib import Path
from uuid import uuid4

import pytest
from sqlmodel import Session, SQLModel, select

sys.path.append(str(Path(__file__).resolve().parents[1]))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ.setdefault("FRONTEND_URL", "http://testserver")

from app.cli.import_opportunities import (  # noqa: E402
    CommandError,
    ImportOutcome,
    import_opportunities_from_csv,
)
from app.db.session import engine  # noqa: E402
from app.models import (  # noqa: E402
    Account,
    AccountKind,
    Opportunity,
    Organization,
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


def test_cli_imports_opportunities_success(tmp_path: Path):
    with Session(engine) as session:
        _create_org(session, email="a@example.com", slug="org-a")
        org_b = _create_org(session, email="b@example.com", slug="org-b")

    csv_path = tmp_path / "opportunities.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "org_slug",
                "org_id",
                "title",
                "description",
                "start_at",
                "end_at",
                "location",
                "timezone",
                "address",
                "zip_code",
                "themes",
                "community_hours",
                "signup_url",
                "is_active",
            ]
        )
        writer.writerow(
            [
                "org-a",
                "",
                "Food Pantry Shift",
                "Stock shelves",
                "2024-05-01T10:00:00Z",
                "2024-05-01T14:00:00Z",
                "NYC",
                "America/New_York",
                "123 Main St",
                "10001",
                "COMMUNITY_SERVICE;ENVIRONMENT",
                "",
                "https://example.org/apply",
                "true",
            ]
        )
        writer.writerow(
            [
                "",
                str(org_b.account_id),
                "Coding Mentorship",
                "Guide students",
                "2024-05-02T15:00:00Z",
                "2024-05-02T18:30:00Z",
                "REMOTE",
                "America/Chicago",
                "",
                "",
                "STEM",
                "",
                "",
                "",
            ]
        )

    outcome = import_opportunities_from_csv(csv_path)
    assert isinstance(outcome, ImportOutcome)
    assert outcome.created == 2
    assert not outcome.errors
    assert not outcome.dry_run

    with Session(engine) as session:
        opportunities = session.exec(select(Opportunity).order_by(Opportunity.title)).all()
        assert len(opportunities) == 2
        titles = {opp.title for opp in opportunities}
        assert titles == {"Food Pantry Shift", "Coding Mentorship"}

        slugs = {opp.slug for opp in opportunities}
        assert len(slugs) == 2
        assert all(slug for slug in slugs)


def test_cli_continue_on_error(tmp_path: Path):
    with Session(engine) as session:
        org = _create_org(session, email="c@example.com", slug="org-c")

    bad_uuid = uuid4()

    csv_path = tmp_path / "opportunities_with_errors.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "org_slug",
                "org_id",
                "title",
                "description",
                "start_at",
                "end_at",
                "location",
                "timezone",
                "address",
                "zip_code",
                "themes",
                "is_active",
            ]
        )
        writer.writerow(
            [
                "org-c",
                "",
                "Community Garden Day",
                "Clean garden",
                "2024-06-01T09:00:00Z",
                "2024-06-01T12:00:00Z",
                "NYC",
                "America/New_York",
                "456 Park Ave",
                "10002",
                "ENVIRONMENT",
                "true",
            ]
        )
        writer.writerow(
            [
                "",
                str(bad_uuid),
                "Invalid Row",
                "Missing org",
                "2024-06-05T10:00:00Z",
                "2024-06-05T11:00:00Z",
                "UNKNOWN",
                "",
                "",
                "",
                "",
                "true",
            ]
        )

    outcome = import_opportunities_from_csv(csv_path, continue_on_error=True)
    assert outcome.created == 1
    assert outcome.errors
    assert outcome.errors[0].line == 3
    assert "No organization found for org_id" in outcome.errors[0].message

    with Session(engine) as session:
        opportunities = session.exec(select(Opportunity)).all()
        assert len(opportunities) == 1
        assert opportunities[0].org_id == org.account_id


def test_cli_aborts_on_first_error(tmp_path: Path):
    with Session(engine) as session:
        _create_org(session, email="d@example.com", slug="org-d")

    csv_path = tmp_path / "bad.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "org_slug",
                "title",
                "description",
                "start_at",
                "end_at",
                "location",
            ]
        )
        writer.writerow(
            [
                "org-d",
                "Incomplete Row",
                "",
                "2024-01-01T00:00:00Z",
                "2024-01-01T01:00:00Z",
                "NYC",
            ]
        )

    with pytest.raises(CommandError) as excinfo:
        import_opportunities_from_csv(csv_path)

    assert "Missing required values" in str(excinfo.value)
    assert excinfo.value.exit_code == 1
