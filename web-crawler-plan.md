# Web Crawler Implementation Plan

## Goals & Assumptions

- Target initial NGO websites to understand structure before broadening coverage.
- Execute crawler via a scheduled backend job (e.g., Celery beat / APScheduler).
- Persist scraped opportunities using the existing opportunity model unless schema gaps require follow-up changes.
- Scrapy is the primary framework; Playwright integration remains optional for JS-heavy pages.

## Phase 1 — Research & Scoping

1. **Catalog target NGOs**: gather URLs, expected sections (opportunities, programs, deadlines) and note authentication or rate limiting constraints.
2. **Define data contract**: map HTML fields to the current opportunity schema (title, URL, description, location, deadlines, tags). Flag mismatches needing model updates.
3. **Decide crawling cadence**: determine refresh frequency per site based on content churn to drive scheduler configuration.

## Phase 2 — Backend Foundation

1. **Create crawler module** under `backend/app` (e.g., `app/crawler/`) with:
   - Scrapy settings (user agents, retry, throttling, cache policy).
   - Pipelines for validation, deduplication, and persistence via SQLAlchemy session helpers.
2. **Integrate configuration** into FastAPI settings (env vars for timeouts, concurrency, site-specific options).
3. **Establish scheduler hook**: choose existing or new scheduler (Celery beat / APScheduler). Add a job that enqueues the Scrapy run and records last-run metadata.

## Phase 3 — Scrapy Project Setup

1. **Initialize Scrapy project** (if external folder) or plug Scrapy components directly in-module to keep a single repo.
2. **Implement base spider** class providing:
   - Common parsing helpers (deadline parsing, text cleanup).
   - Error handling and logging instrumentation.
   - Optional Playwright mixin placeholder so future JS-capable spiders can inherit without refactors.
3. **Add pipelines**:
   - `ValidationPipeline`: ensure required fields present, convert dates.
   - `OpportunityPipeline`: upsert into DB using opportunity model; prevent duplicates via URL hash or unique slug.

## Phase 4 — Initial NGO Spiders

1. Build 2–3 concrete spiders for the highest-priority NGOs:
   - Hardcode start URLs, allowed domains, pagination selectors.
   - Use item loaders to normalize fields into the opportunity schema.
   - Add per-site tests/mocks where practical (e.g., parsing fixtures).
2. Capture parsing quirks and document them in `README` or module docstrings to guide future sites.

## Phase 5 — Scheduling & Orchestration

1. **Job runner**: create a command (e.g., `python -m app.crawler.run NGO_NAME`) that the scheduler invokes; it should:
   - Accept site list arguments or “all”.
   - Emit structured logs for observability.
2. **Scheduler config**: add entries for each NGO with cadence derived from Phase 1; ensure idempotent runs and failure alerts (e.g., email/log hook).
3. **State tracking**: store last-success timestamp per site to avoid reprocessing identical listings unless changed.

## Phase 6 — Validation & Observability

1. **Unit/integration tests**:
   - Parsing helpers with HTML fixtures.
   - Pipelines hitting an in-memory SQLite (mirroring current test approach).
2. **End-to-end smoke test**: run a spider against a local fixture or cached response to ensure full pipeline executes.
3. **Monitoring hooks**: add metrics/logging (success count, errors per site). Optionally integrate with existing alerting if available.

## Phase 7 — Playwright Readiness

- Abstract request handling so spiders can opt into Playwright when needed (feature flag or spider attribute).
- Document prerequisites (Node install, playwright browsers) but defer installation/config until a site requires JS rendering.

## Deliverables Checklist

- [ ] `app/crawler/` module with settings, pipelines, spiders.
- [ ] CLI or scheduler entrypoint to run specific spiders.
- [ ] Tests covering parsing and persistence logic.
- [ ] Documentation updates (README + env var reference + how to add new site).
- [ ] Scheduler configuration pointing at the new entrypoint.
