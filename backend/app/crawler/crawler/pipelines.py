import hashlib
import logging
import re
import secrets
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Dict, Optional, Tuple
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
from app.models.opportunity import Location, Opportunity, Theme  # type: ignore  # noqa: E402
from app.models.organization import Organization  # type: ignore  # noqa: E402
from app.schemas.opportunity_schema import OpportunityCreate  # type: ignore  # noqa: E402
from app.services.opportunity_service import (  # type: ignore  # noqa: E402
    create_opportunity,
    slugify_title,
)

ZIP_RE = re.compile(r"\b\d{5}(?:-\d{4})?\b")
DATE_FORMATS = [
    "%Y-%m-%d",
    "%m/%d/%Y",
    "%m/%d/%y",
    "%B %d, %Y",
    "%b %d, %Y",
    "%A, %B %d, %Y",
    "%A, %b %d, %Y",
]
TIME_FORMATS = ["%I:%M %p", "%I %p"]

ISSUE_AREA_THEME_MAP: Dict[str, list[Theme]] = {
    "animals": [Theme.ANIMAL_WELFARE],
    "arts & culture": [Theme.ARTS],
    "board service & organizational development": [Theme.COMMUNITY_SERVICE],
    "education & schools": [Theme.EDUCATION],
    "eliminate hunger": [Theme.FOOD_SECURITY],
    "eliminate poverty": [Theme.ECONOMIC_EMPOWERMENT],
    "emergency response & preparedness": [Theme.EMERGENCY_RESPONSE],
    "environmental care": [Theme.ENVIRONMENT],
    "gender equity": [Theme.SOCIAL_JUSTICE],
    "health & well-being": [Theme.HEALTH],
    "human rights": [Theme.SOCIAL_JUSTICE],
    "immigrant & refugee services": [Theme.SOCIAL_JUSTICE],
    "mentoring": [Theme.EDUCATION],
    "older adults": [Theme.COMMUNITY_SERVICE],
    "other": [Theme.COMMUNITY_SERVICE],
    "parks and gardens": [Theme.ENVIRONMENT],
    "people with disabilities": [Theme.SOCIAL_JUSTICE],
    "social justice": [Theme.SOCIAL_JUSTICE],
    "sports & recreation": [Theme.SPORTS],
    "tax prep": [Theme.ECONOMIC_EMPOWERMENT],
    "workforce development": [Theme.WORKFORCE_DEVELOPMENT],
    "youth": [Theme.EDUCATION],
}


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
        preferred_email = self._sanitize_email(adapter.get("org_contact_email"))

        cached = self._org_cache.get(slug)
        if cached:
            return cached

        stmt = select(Organization).where(Organization.slug == slug)
        organization = self.session.exec(stmt).first()
        if organization:
            self._org_cache[slug] = organization.account_id
            return organization.account_id

        account_email = self._resolve_org_email(slug, preferred_email)
        account = Account(
            email=account_email,
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
            contact_email=preferred_email or account.email,
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

        occ_start, occ_end, has_precise_hours = self._parse_occurrence_schedule(
            adapter.get("occurrence_day"),
            adapter.get("occurrence_time"),
            adapter.get("occurrence_end_date"),
            timezone_obj,
            adapter.get("occurrence_start_iso"),
            adapter.get("occurrence_end_iso"),
        )
        if occ_start:
            start_at = occ_start
        if occ_end:
            end_at = occ_end

        if start_at is None:
            tz = timezone_obj or self._safe_zoneinfo(self.default_timezone)
            start_at = datetime.now(tz or UTC)
        if end_at is None:
            end_at = start_at + timedelta(hours=1)

        location_enum, address, zip_code = self._resolve_location_fields(adapter)

        description = adapter.get("description_html") or adapter.get("description")
        if not description:
            description = (
                (adapter.get("raw_listing") or {}).get("Description")
                or adapter.get("title")
                or "Opportunity description unavailable."
            )

        community_hours = (
            self._calculate_hours(occ_start, occ_end) if has_precise_hours else None
        )

        if community_hours is None:
            community_hours = 1

        payload = OpportunityCreate(
            org_id=org_id,
            title=adapter.get("title") or "Untitled Opportunity",
            description=self._truncate_description(description),
            start_at=start_at,
            end_at=end_at,
            timezone=timezone_name,
            location=location_enum,
            address=address[:200] if address else None,
            zip_code=zip_code,
            themes=self._map_issue_areas(adapter.get("issue_areas")),
            signup_url=adapter.get("occurrence_url"),
            community_hours=community_hours,
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

    def _map_issue_areas(self, issue_field) -> Optional[list[Theme]]:
        if not issue_field:
            return None

        themes: list[Theme] = []

        if isinstance(issue_field, str):
            candidates = re.split(r"[;,/]", issue_field)
        else:
            candidates = issue_field

        for raw in candidates:
            if not raw:
                continue
            key = raw.strip().lower()
            mapped = ISSUE_AREA_THEME_MAP.get(key)
            if not mapped:
                continue
            for theme in mapped:
                if theme not in themes:
                    themes.append(theme)

        return themes or None

    def _parse_occurrence_schedule(
        self,
        day_label: Optional[str],
        time_label: Optional[str],
        end_label: Optional[str],
        timezone: ZoneInfo | None,
        iso_start: Optional[str] = None,
        iso_end: Optional[str] = None,
    ) -> Tuple[Optional[datetime], Optional[datetime], bool]:
        precise = False

        if iso_start:
            try:
                start_dt = datetime.fromisoformat(iso_start.replace("Z", "+00:00"))
                if timezone and start_dt.tzinfo is not None:
                    start_dt = start_dt.astimezone(timezone)
            except ValueError:
                start_dt = None
        else:
            start_dt = None

        if iso_end:
            try:
                end_dt = datetime.fromisoformat(iso_end.replace("Z", "+00:00"))
                if timezone and end_dt.tzinfo is not None:
                    end_dt = end_dt.astimezone(timezone)
            except ValueError:
                end_dt = None
        else:
            end_dt = None

        if start_dt and end_dt:
            return start_dt, end_dt, True

        start_date = self._parse_date_label(day_label)
        end_date = self._parse_date_label(end_label)

        if start_date and time_label:
            start_time_str, _, end_time_str = time_label.partition("-")
            start_dt = self._combine_date_time(start_date, start_time_str.strip(), timezone)
            if end_time_str.strip():
                end_dt = self._combine_date_time(start_date, end_time_str.strip(), timezone)
                precise = start_dt is not None and end_dt is not None
        elif start_date:
            start_dt = self._combine_date_time(start_date, None, timezone)

        if end_date and (end_dt is None or (start_dt and end_dt < start_dt)):
            end_dt = self._combine_date_time(end_date, None, timezone)

        return start_dt, end_dt, precise

    def _parse_date_label(self, value: Optional[str]) -> Optional[datetime]:
        if not value:
            return None
        text = value.strip()
        for fmt in DATE_FORMATS:
            try:
                parsed = datetime.strptime(text, fmt)
                return parsed
            except ValueError:
                continue
        return None

    def _combine_date_time(
        self, date_obj: datetime, time_str: Optional[str], timezone: ZoneInfo | None
    ) -> Optional[datetime]:
        tz = timezone or self._safe_zoneinfo(self.default_timezone) or UTC
        if time_str:
            cleaned = time_str.replace("ET", "").strip()
            for fmt in TIME_FORMATS:
                try:
                    time_obj = datetime.strptime(cleaned, fmt)
                    combined = datetime(
                        year=date_obj.year,
                        month=date_obj.month,
                        day=date_obj.day,
                        hour=time_obj.hour,
                        minute=time_obj.minute,
                        tzinfo=tz,
                    )
                    return combined
                except ValueError:
                    continue
        return datetime(
            year=date_obj.year,
            month=date_obj.month,
            day=date_obj.day,
            hour=0,
            minute=0,
            tzinfo=tz,
        )

    def _calculate_hours(
        self, start_at: Optional[datetime], end_at: Optional[datetime]
    ) -> Optional[int]:
        if not start_at or not end_at:
            return None
        delta = end_at - start_at
        hours = int(delta.total_seconds() // 3600)
        return max(hours, 1) if hours > 0 else 1

    def _truncate_description(self, description: str) -> str:
        trimmed = description.strip()
        return trimmed[:4000]

    def _sanitize_email(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        candidate = value.strip()
        return candidate if candidate and "@" in candidate else None

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

    def _resolve_org_email(self, slug: str, preferred: Optional[str]) -> str:
        if self.session is None:
            return preferred or f"{slug}@{self.org_email_domain}"

        if preferred and not self._email_exists(preferred):
            return preferred

        base_email = f"{slug}@{self.org_email_domain}"
        email = base_email
        counter = 1
        while self._email_exists(email):
            email = f"{slug}-{counter}@{self.org_email_domain}"
            counter += 1
        return email

    def _email_exists(self, email: str) -> bool:
        if self.session is None:
            return False
        stmt = select(Account).where(Account.email == email)
        return self.session.exec(stmt).first() is not None

    def _generate_placeholder_hash(self) -> str:
        token = secrets.token_hex(16)
        return hashlib.sha256(token.encode("utf-8")).hexdigest()
