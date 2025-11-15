import hashlib
import logging
import secrets
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Dict, Optional
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from itemadapter import ItemAdapter
from pydantic import ValidationError
from sqlmodel import Session, select

APP_DIR = Path(__file__).resolve().parents[3]
if str(APP_DIR) not in sys.path:
    sys.path.append(str(APP_DIR))

from app.db.session import engine  # type: ignore  # noqa: E402
from app.models.account import Account, AccountKind  # type: ignore  # noqa: E402
from app.models.opportunity import Location, Opportunity  # type: ignore  # noqa: E402
from app.models.organization import Organization  # type: ignore  # noqa: E402
from app.schemas.opportunity_schema import OpportunityCreate  # type: ignore  # noqa: E402
from app.services.opportunity_service import (  # type: ignore  # noqa: E402
    create_opportunity,
    slugify_title,
)

ZIP_RE = __import__("re").compile(r"\b\d{5}(?:-\d{4})?\b")


class OpportunityPipeline:
    """Scrapy pipeline that persists opportunities into the core database."""

    def __init__(self, default_timezone: str, org_email_domain: str) -> None:
        self.default_timezone = default_timezone
        self.org_email_domain = org_email_domain
        self.session: Session | None = None
        self._org_cache: Dict[str, UUID] = {}
        self._reserved_slugs: set[str] = set()
        self.logger = logging.getLogger(__name__)

    @classmethod
    def from_crawler(cls, crawler):
        default_timezone = crawler.settings.get("OPPORTUNITY_DEFAULT_TIMEZONE", "America/New_York")
        org_email_domain = crawler.settings.get("IMPORT_ORG_EMAIL_DOMAIN", "import.vocatio")
        return cls(default_timezone=default_timezone, org_email_domain=org_email_domain)

    def open_spider(self, spider):
        self.session = Session(engine)

    def close_spider(self, spider):
        if self.session:
            self.session.close()
            self.session = None

    def process_item(self, item, spider):
        if self.session is None:
            raise RuntimeError("Database session not initialized")

        adapter = ItemAdapter(item)
        signup_url = adapter.get("occurrence_url")

        if self._opportunity_exists(signup_url):
            spider.logger.info("Skipping existing opportunity at %s", signup_url)
            return item

        try:
            org_id = self._ensure_organization(adapter)
            payload = self._build_payload(adapter, org_id)
        except (ValueError, ValidationError) as exc:
            spider.logger.warning(
                "Skipping opportunity SID %s due to validation error: %s",
                adapter.get("sid"),
                exc,
            )
            return item
        except Exception as exc:  # pragma: no cover - defensive logging
            spider.logger.error(
                "Unexpected error preparing opportunity SID %s: %s",
                adapter.get("sid"),
                exc,
            )
            return item

        try:
            create_opportunity(
                self.session,
                payload,
                reserved_slugs=self._reserved_slugs,
                commit=False,
                refresh=False,
            )
            self.session.commit()
            spider.logger.info("Persisted opportunity SID %s", adapter.get("sid"))
        except Exception as exc:  # pragma: no cover - DB level issues
            self.session.rollback()
            spider.logger.error("Failed to persist opportunity SID %s: %s", adapter.get("sid"), exc)

        return item

    def _opportunity_exists(self, signup_url: Optional[str]) -> bool:
        if self.session is None or not signup_url:
            return False
        stmt = select(Opportunity).where(Opportunity.signup_url == signup_url)
        return self.session.exec(stmt).first() is not None

    def _ensure_organization(self, adapter: ItemAdapter) -> UUID:
        if self.session is None:
            raise RuntimeError("Database session not initialized")

        name = adapter.get("organization_name") or "Imported Organization"
        slug = slugify_title(name) or f"org-{adapter.get('sid') or 'unknown'}"

        cached = self._org_cache.get(slug)
        if cached:
            return cached

        stmt = select(Organization).where(Organization.slug == slug)
        organization = self.session.exec(stmt).first()
        if organization:
            self._org_cache[slug] = organization.account_id
            return organization.account_id

        account = Account(
            email=self._build_org_email(slug),
            hashed_password=self._generate_placeholder_hash(),
            kind=AccountKind.ORG,
            is_active=False,
        )
        self.session.add(account)
        self.session.flush()

        organization = Organization(
            account_id=account.id,
            name=name,
            slug=slug,
            contact_email=account.email,
        )
        self.session.add(organization)
        self.session.flush()

        self._org_cache[slug] = organization.account_id
        return organization.account_id

    def _build_payload(self, adapter: ItemAdapter, org_id: UUID) -> OpportunityCreate:
        timezone_str = adapter.get("timezone") or self.default_timezone
        timezone_obj = self._safe_zoneinfo(timezone_str)
        timezone_name = (
            timezone_obj.key if isinstance(timezone_obj, ZoneInfo) else self.default_timezone
        )

        start_at = self._parse_datetime(adapter.get("start_datetime"), timezone_obj)
        end_at = self._parse_datetime(adapter.get("end_datetime"), timezone_obj)

        if start_at is None:
            tz = timezone_obj or self._safe_zoneinfo(self.default_timezone)
            start_at = datetime.now(tz or UTC)
        if end_at is None:
            end_at = start_at + timedelta(hours=1)

        location_enum, address, zip_code = self._resolve_location_fields(adapter)

        description = (
            adapter.get("description")
            or (adapter.get("raw_listing") or {}).get("Description")
            or adapter.get("title")
            or "Opportunity description unavailable."
        )

        payload = OpportunityCreate(
            org_id=org_id,
            title=adapter.get("title") or "Untitled Opportunity",
            description=description[:4000],
            start_at=start_at,
            end_at=end_at,
            timezone=timezone_name,
            location=location_enum,
            address=address[:200] if address else None,
            zip_code=zip_code,
            themes=None,
            signup_url=adapter.get("occurrence_url"),
            is_active=True,
        )

        return payload

    def _resolve_location_fields(
        self, adapter: ItemAdapter
    ) -> tuple[Location, Optional[str], Optional[str]]:
        location_type = (adapter.get("location_type") or "").lower()
        text_location = (
            adapter.get("detail_location") or adapter.get("location_text") or ""
        ).strip()

        if location_type == "virtual":
            return Location.REMOTE, None, None

        if not text_location:
            return Location.REMOTE, None, None

        normalized = text_location.lower()
        if "miami" in normalized or "fl" in normalized:
            location_enum = Location.MIAMI
        elif "new york" in normalized or ", ny" in normalized or normalized.endswith(" ny"):
            location_enum = Location.NYC
        else:
            location_enum = Location.OTHER

        zip_code = None
        match = ZIP_RE.search(text_location)
        if match:
            zip_code = match.group(0)

        return location_enum, text_location, zip_code

    def _parse_datetime(
        self, value: Optional[str], timezone: ZoneInfo | None
    ) -> Optional[datetime]:
        if not value:
            return None

        normalized = value.replace("Z", "+00:00")
        try:
            parsed = datetime.fromisoformat(normalized)
        except ValueError:
            return None

        if parsed.tzinfo is None:
            if timezone:
                parsed = parsed.replace(tzinfo=timezone)
            else:
                parsed = parsed.replace(tzinfo=ZoneInfo(self.default_timezone))
        return parsed

    def _safe_zoneinfo(self, name: str) -> ZoneInfo | None:
        try:
            return ZoneInfo(name)
        except ZoneInfoNotFoundError:
            try:
                return ZoneInfo(self.default_timezone)
            except ZoneInfoNotFoundError:
                return None

    def _build_org_email(self, slug: str) -> str:
        base_email = f"{slug}@{self.org_email_domain}"
        email = base_email
        counter = 1

        if self.session is None:
            return email

        while self.session.exec(select(Account).where(Account.email == email)).first():
            email = f"{slug}-{counter}@{self.org_email_domain}"
            counter += 1
        return email

    def _generate_placeholder_hash(self) -> str:
        token = secrets.token_hex(16)
        return hashlib.sha256(token.encode("utf-8")).hexdigest()
