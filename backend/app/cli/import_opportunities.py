from __future__ import annotations

import csv
import pathlib
import uuid
from dataclasses import dataclass
from typing import Any

try:
    import typer
except ImportError:  # pragma: no cover - typer optional for testing environments
    typer = None  # type: ignore[assignment]

from pydantic import ValidationError
from sqlmodel import Session, select

from app.db.session import engine
from app.models.opportunity import Location, Theme
from app.models.organization import Organization
from app.schemas.opportunity_schema import OpportunityCreate
from app.services.opportunity_service import OrganizationLookupError, create_opportunity

THEME_DELIMITER = ";"
TRUE_VALUES = {"true", "1", "yes", "y", "t"}
FALSE_VALUES = {"false", "0", "no", "n", "f"}

MANDATORY_COLUMNS = {"title", "description", "start_at", "end_at", "location"}
OPTIONAL_COLUMNS = {
    "org_id",
    "org_slug",
    "timezone",
    "address",
    "zip_code",
    "themes",
    "community_hours",
    "signup_url",
    "is_active",
}
ALLOWED_COLUMNS = MANDATORY_COLUMNS | OPTIONAL_COLUMNS


@dataclass(slots=True)
class ImportErrorDetail:
    line: int
    message: str


class RowValidationError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)


@dataclass(slots=True)
class ImportOutcome:
    created: int
    errors: list[ImportErrorDetail]
    dry_run: bool


class CommandError(Exception):
    def __init__(
        self,
        message: str,
        *,
        exit_code: int = 1,
        errors: list[ImportErrorDetail] | None = None,
    ) -> None:
        super().__init__(message)
        self.exit_code = exit_code
        self.errors = errors or []


class OrganizationCache:
    """Caches organization lookups to avoid repeated DB hits."""

    def __init__(self) -> None:
        self._ids: set[uuid.UUID] = set()
        self._slug_to_id: dict[str, uuid.UUID] = {}

    def resolve(
        self,
        session: Session,
        *,
        org_id_raw: str | None,
        org_slug_raw: str | None,
    ) -> uuid.UUID:
        org_id = _normalize(org_id_raw)
        org_slug = _normalize(org_slug_raw)

        if not org_id and not org_slug:
            raise RowValidationError("'org_id' or 'org_slug' must be provided")

        if org_id:
            try:
                org_uuid = uuid.UUID(org_id)
            except ValueError as exc:
                raise RowValidationError("org_id must be a valid UUID") from exc

            if org_uuid not in self._ids:
                if not session.get(Organization, org_uuid):
                    raise RowValidationError("No organization found for org_id")
                self._ids.add(org_uuid)

            if org_slug:
                resolved = self._resolve_by_slug(session, org_slug)
                if resolved != org_uuid:
                    raise RowValidationError(
                        "org_id and org_slug refer to different organizations"
                    )
            return org_uuid

        # org_id missing, fall back to slug
        assert org_slug is not None  # for type checker
        return self._resolve_by_slug(session, org_slug)

    def _resolve_by_slug(self, session: Session, slug: str) -> uuid.UUID:
        key = slug.lower()
        if key in self._slug_to_id:
            return self._slug_to_id[key]

        organization = session.exec(
            select(Organization).where(Organization.slug == slug)
        ).first()
        if not organization:
            raise RowValidationError("No organization found for org_slug")

        self._slug_to_id[key] = organization.account_id
        self._ids.add(organization.account_id)
        return organization.account_id


def _normalize(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _parse_bool(value: str, *, field: str) -> bool:
    lowered = value.lower()
    if lowered in TRUE_VALUES:
        return True
    if lowered in FALSE_VALUES:
        return False
    raise RowValidationError(f"{field} must be one of {sorted(TRUE_VALUES | FALSE_VALUES)}")


def _parse_themes(raw: str | None) -> list[str] | None:
    normalized = _normalize(raw)
    if not normalized:
        return None
    entries = [part.strip() for part in normalized.split(THEME_DELIMITER)]
    themes: list[str] = []
    for entry in entries:
        if not entry:
            continue
        upper = entry.upper()
        if upper not in Theme.__members__:
            raise RowValidationError(
                f"Unknown theme '{entry}'. Expected one of {', '.join(Theme.__members__)}"
            )
        themes.append(upper)
    return themes or None


def _build_payload(
    row: dict[str, str],
    session: Session,
    cache: OrganizationCache,
) -> OpportunityCreate:
    unexpected_columns = set(row.keys()) - ALLOWED_COLUMNS
    if unexpected_columns:
        raise RowValidationError(
            f"Unexpected columns present: {', '.join(sorted(unexpected_columns))}"
        )

    missing = [col for col in MANDATORY_COLUMNS if not _normalize(row.get(col))]
    if missing:
        raise RowValidationError(f"Missing required values for: {', '.join(missing)}")

    org_id = cache.resolve(
        session,
        org_id_raw=row.get("org_id"),
        org_slug_raw=row.get("org_slug"),
    )

    location_raw = _normalize(row.get("location"))
    assert location_raw is not None  # enforced above
    location_value = location_raw.upper()
    if location_value not in Location.__members__:
        raise RowValidationError(
            f"Unknown location '{location_raw}'. Expected one of {', '.join(Location.__members__)}"
        )

    payload_data: dict[str, Any] = {
        "org_id": org_id,
        "title": row["title"],
        "description": row["description"],
        "start_at": row["start_at"],
        "end_at": row["end_at"],
        "location": location_value,
    }

    timezone = _normalize(row.get("timezone"))
    if timezone:
        payload_data["timezone"] = timezone

    address = _normalize(row.get("address"))
    if address:
        payload_data["address"] = address

    zip_code = _normalize(row.get("zip_code"))
    if zip_code:
        payload_data["zip_code"] = zip_code

    themes = _parse_themes(row.get("themes"))
    if themes is not None:
        payload_data["themes"] = themes

    community_hours_raw = _normalize(row.get("community_hours"))
    if community_hours_raw is not None:
        try:
            payload_data["community_hours"] = int(community_hours_raw)
        except ValueError as exc:
            raise RowValidationError("community_hours must be an integer") from exc

    signup_url = _normalize(row.get("signup_url"))
    if signup_url:
        payload_data["signup_url"] = signup_url

    is_active_raw = _normalize(row.get("is_active"))
    if is_active_raw is not None:
        payload_data["is_active"] = _parse_bool(is_active_raw, field="is_active")

    try:
        return OpportunityCreate.model_validate(payload_data)
    except ValidationError as exc:
        raise RowValidationError(str(exc)) from exc


def import_opportunities_from_csv(
    csv_path: pathlib.Path,
    *,
    dry_run: bool = False,
    continue_on_error: bool = False,
) -> ImportOutcome:
    """Core CSV import workflow shared by CLI and tests."""

    csv_path = pathlib.Path(csv_path)

    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)

        if reader.fieldnames is None:
            raise CommandError("CSV file is missing a header row", exit_code=2)

        header_set = set(reader.fieldnames)
        missing_columns = MANDATORY_COLUMNS - header_set
        if missing_columns:
            raise CommandError(
                f"CSV missing required columns: {', '.join(sorted(missing_columns))}",
                exit_code=2,
            )

        if "org_id" not in header_set and "org_slug" not in header_set:
            raise CommandError("CSV must include either 'org_id' or 'org_slug'", exit_code=2)

        payloads: list[OpportunityCreate] = []
        errors: list[ImportErrorDetail] = []

        with Session(engine) as session:
            cache = OrganizationCache()

            for index, row in enumerate(reader, start=2):  # header = line 1
                try:
                    payload = _build_payload(row, session, cache)
                except RowValidationError as exc:
                    detail = ImportErrorDetail(line=index, message=str(exc))
                    errors.append(detail)
                    if not continue_on_error:
                        raise CommandError(
                            f"Import aborted, error on line {index}: {exc}",
                            exit_code=1,
                            errors=[detail],
                        ) from exc
                    continue

                payloads.append(payload)

            reserved_slugs: set[str] = set()
            created = 0

            try:
                for payload in payloads:
                    create_opportunity(
                        session,
                        payload,
                        reserved_slugs=reserved_slugs,
                        commit=False,
                        refresh=False,
                    )
                    created += 1
            except OrganizationLookupError as exc:
                session.rollback()
                raise CommandError(str(exc), exit_code=1) from exc
            except ValueError as exc:
                session.rollback()
                raise CommandError(str(exc), exit_code=1) from exc

            if dry_run:
                session.rollback()
            else:
                session.commit()

        return ImportOutcome(created=created, errors=errors, dry_run=dry_run)


if typer:

    def import_opportunities(
        csv_path: pathlib.Path = typer.Argument(
            ..., exists=True, dir_okay=False, readable=True
        ),
        *,
        apply: bool = typer.Option(
            False,
            "--apply",
            help="Persist changes to the database instead of performing a dry run",
            is_flag=True,
        ),
        continue_on_error: bool = typer.Option(
            False, help="Skip invalid rows instead of aborting the whole import"
        ),
    ) -> None:
        """Import opportunities from a normalized CSV file."""

        try:
            outcome = import_opportunities_from_csv(
                csv_path,
                dry_run=not apply,
                continue_on_error=continue_on_error,
            )
        except CommandError as exc:
            typer.echo(exc.args[0], err=True)
            for err_detail in exc.errors:
                typer.echo(f"  line {err_detail.line}: {err_detail.message}", err=True)
            raise typer.Exit(code=exc.exit_code) from exc

        if outcome.dry_run:
            typer.echo(
                f"Dry run complete: {outcome.created} opportunities validated (no changes saved)."
            )
        else:
            typer.echo(f"Imported {outcome.created} opportunities.")

        if outcome.errors:
            typer.echo("Encountered the following row errors:")
            for err in outcome.errors:
                typer.echo(f"  line {err.line}: {err.message}")
            raise typer.Exit(code=1)

        raise typer.Exit(code=0)


else:  # pragma: no cover - triggered only when typer is unavailable

    def import_opportunities(*args: object, **kwargs: object) -> None:
        raise RuntimeError(
            "Typer is required for the CLI. Install it or run the import helper directly."
        )


__all__ = [
    "import_opportunities",
    "import_opportunities_from_csv",
    "ImportErrorDetail",
    "ImportOutcome",
    "CommandError",
]
