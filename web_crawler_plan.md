# Web Crawler Plan

## 1. Purpose & Context

- Build an internal crawler pipeline to discover, ingest, and surface volunteer and job opportunities from NGO websites into the `vocatio` platform.
- Integrate with existing backend (`backend/app`) to persist normalized opportunities that can be exposed via API and displayed in the frontend.
- Provide a foundation that scales from a handful of curated NGO sources to a larger catalog while staying compliant with site policies.

## 2. Objectives & Success Criteria

- **Coverage:** Crawl an initial set of 3–5 NGO sources end-to-end, producing structured `Opportunity` records with ≥90 % field completeness for required attributes (title, organization, location, deadlines, canonical URL).
- **Freshness:** New opportunities appear in the system within 12 hours of publication; stale entries are marked inactive within 48 hours of disappearance.
- **Reliability:** Scheduled crawls maintain ≥95 % success rate per source, with alerting on repeated failures.
- **Maintainability:** Adding a new NGO source should require no more than one day of effort, aided by well-documented parser templates and tests.
- **Compliance:** Every crawl honors `robots.txt`, TOS, and rate limits, and logs consent metadata for auditability.

## 3. Scope & Assumptions

- **In scope (MVP):** Public listings pages, HTML/JSON content, pagination, date normalization, deduplication, storage, and API exposure.
- **Deferred:** Authenticated portals, CAPTCHA-protected flows, PDF scraping, and multilingual translation.
- **Assumptions:** NGO sites allow crawling of opportunity listings; no immediate need for distributed crawling infrastructure; Postgres remains the system of record; workers run within current infrastructure (Docker + Celery or similar).

## 4. High-Level Architecture

1. **Scheduler** (Celery beat/cron) enqueues crawl jobs per source based on configured frequency.
2. **Fetcher Workers** retrieve pages (HTTPX/Requests) respecting robots, rate limits, and timeouts; optionally use Playwright for JS-rendered pages.
3. **Parser Layer** (per-site modules in `backend/app/crawler/parsers`) extracts raw opportunity fields using CSS/XPath/JSON selectors.
4. **Normalizer & Enricher** standardizes fields (titles, locations, tags), cleans HTML, derives deadlines.
5. **Entity Resolution & Deduplication** matches against existing opportunities using hash keys and fuzzy matching.
6. **Persistence** writes normalized data to `Opportunity` tables and stores raw snapshots for traceability.
7. **API Exposure** reuses/extends FastAPI routes under `backend/app/api/routes` to serve filtered opportunities.
8. **Monitoring & Alerts** capture metrics/logs, surfaced via dashboard and Slack/email notifications.

## 5. Data Source Management

- Create `crawler_sources` table (SQLModel/SQLAlchemy) with fields: `id`, `name`, `base_url`, `crawl_frequency`, `parser_type`, `auth`, `last_success`, `last_error`, `status`, `notes`.
- Maintain seed data under `backend/app/db/seed/` or migration for initial NGO list.
- Provide admin interface/API to update source metadata, pause/resume sources, and record contacts/permissions.

## 6. Fetching Strategy

- Use HTTPX with retry/backoff, connection pooling, custom headers, and per-source rate limits.
- Parse and respect `robots.txt`; store a cache with next refresh timestamp.
- Support request signing/auth headers where necessary via configuration.
- Add Playwright (headless Chromium) fallback for pages requiring JS rendering; guard with feature flag per source to control cost.
- Store raw response metadata (status, headers, fetched_at) in `crawler_fetch_logs` table for observability.

## 7. Parsing & Extraction

- Organize parser modules per source (e.g., `backend/app/crawler/parsers/red_cross.py`) implementing a shared interface `parse_opportunities(html: str) -> list[OpportunityPayload]`.
- Config-driven selectors (e.g., YAML/JSON) to reduce code duplication; fallback to custom code when needed.
- Handle pagination, next links, and date formatting per site.
- Normalize text early (strip whitespace, decode HTML entities, remove tracking params).
- Capture attachments/links as structured data for future enrichment.

## 8. Normalization & Enrichment

- Clean HTML snippets with Bleach; convert to Markdown/plain text for storage.
- Standardize locations using `pycountry` / geocoder; populate country, region, city fields.
- Tag opportunities with predefined taxonomy (e.g., `education`, `health`, `policy`) using keyword heuristics or ML classifier later.
- Derive `application_deadline` from strings (with fallback `None`), infer `remote_available` flag.
- Generate canonical slug/identifier for consistent URLs.

## 9. Entity Resolution & Deduplication

- Compute deterministic key: `sha1(organization_domain + title + deadline + location)`.
- Before insert, check for matching key; if found, update existing record with latest data and refresh timestamps.
- Add optional fuzzy match (RapidFuzz) on title + organization when deterministic key fails but similarity > threshold; log collisions for manual review.
- Track `opportunity_hashes` table to record historical versions and change detection.

## 10. Persistence & Data Model Updates

- Extend/introduce models in `backend/app/models`:
  - `CrawlerSource`
  - `CrawlJob` (scheduled execution with status, timestamps, error logs)
  - `RawPageSnapshot` (source_id, url, fetched_at, content_hash, storage pointer)
  - `Opportunity` (existing or new) with normalized fields, status enum (`active`, `stale`, `removed`)
  - `OpportunityVersion` (change log for auditing)
- Create matching Pydantic schemas under `backend/app/schemas` for API responses.
- Update Alembic migrations (`backend/app/alembic/versions/`) to add new tables and relationships.

## 11. Scheduling & Operations

- Use Celery beat or APScheduler to enqueue crawl tasks per source; support cron-like frequencies (hourly, daily).
- Worker queue processes crawl tasks with concurrency controls.
- Implement retry policy (e.g., 3 attempts with exponential backoff) and circuit breaker disabling a source after repeated failures, requiring manual re-enable.
- Store job results in `CrawlJob` with metrics: duration, pages fetched, opportunities discovered, duplicates skipped.
- Provide CLI command (`python -m app.crawler.run --source <id>`) for manual ad-hoc runs.

## 12. Monitoring, Logging & Alerting

- Structured logging (JSON) capturing source_id, job_id, status, counts; integrate with existing logging config in `backend/app/core/logging.py`.
- Metrics: success rate, fetch latency, parse failures, new vs. updated opportunities; expose via Prometheus endpoint or StatsD.
- Alerts: trigger notifications when failure rate > threshold, no opportunities found for >N runs, or parsing errors spike.
- Maintain dashboards (e.g., Grafana) and weekly report summarizing crawl coverage and health.

## 13. Security & Compliance

- Review each NGO’s terms of service; document permissions in `crawler_sources.notes`.
- Honor data retention policies; do not store personal data beyond what's publicly published.
- Securely manage API keys/credentials via environment variables (`backend/.env`) and avoid logging sensitive information.
- Implement user-agent string identifying `vocatio crawler` with contact email.

## 14. Testing Strategy

- **Unit tests:** Parser modules with fixture HTML under `backend/tests/crawler/fixtures`.
- **Integration tests:** End-to-end crawl using saved pages, ensuring normalization/persistence works; run with `pytest -q`.
- **Contract tests:** Validate selectors against live pages in staging environment with manual approval.
- **Performance tests:** Benchmark crawling throughput and deduplication logic using stress fixtures.
- **Regression tests:** Snapshot expected `Opportunity` payloads to catch parser drift.

## 15. Developer Workflow

- Local run instructions:
  1. `cd backend && python -m venv .venv && source .venv/bin/activate`
  2. `pip install -r requirements.txt && pip install httpx[http2] playwright`
  3. `playwright install chromium` (if using headless browser)
  4. `alembic upgrade head`
  5. `pytest -q backend/tests/crawler`
  6. `python -m app.crawler.run --source <source_name>`
- Add Makefile targets for common tasks (`make crawl SOURCE=red_cross`).
- Document environment variables (e.g., `CRAWLER_USER_AGENT`, `CRAWLER_DEFAULT_TIMEOUT`) in README.

## 16. Phased Implementation Roadmap

1. **Design (Week 1):** Finalize data models, API contract, and tooling choices; draft migration scripts.
2. **Infrastructure Setup (Week 2):** Implement scheduler skeleton, database tables, logging scaffolding.
3. **Pilot Source (Weeks 3–4):** Build parser + normalization for first NGO; validate deduplication; expose opportunities via API endpoint for internal use.
4. **Hardening (Week 5):** Add monitoring, retry logic, alerting, and admin controls; address QA feedback.
5. **Scale-Out (Weeks 6–8):** Onboard additional sources, refine taxonomy, introduce Playwright where required.
6. **Post-MVP (Continuous):** Automate source onboarding workflow, add ML classification, explore user-facing moderation tools.

## 17. Risks & Mitigations

- **Site Changes Break Parsers:** Mitigate with nightly smoke tests, diff-based alerts, and fallbacks to manual queue.
- **Blocking / Rate Limits:** Respect robots, throttle aggressively, rotate proxies only if legally permitted, maintain contact with NGOs.
- **Data Quality Drift:** Monitor field completeness metrics, add human review dashboard for flagged records.
- **Operational Overhead:** Automate alerting and provide clear playbooks for OnCall intervention.

## 18. Open Questions

- Which scheduling framework aligns best with existing infrastructure (Celery vs. FastAPI background tasks vs. Temporal)?
- Do we require a UI for managing sources in MVP or can we rely on CLI/API for now?
- Are there legal reviews needed before crawling certain NGOs or storing data long-term?
- Should ingestion push directly into production DB or flow through a message queue/event bus?
- What SLA do stakeholders expect for new opportunity availability?
