# PR_26171_GAMMA_021 Follow-Up PR Sequence

## 1. Messages Database Cutover

Owner: Team Beta

Purpose:
- Replace `src/dev-runtime/messages/messages-sqlite-service.mjs`.
- Keep the Messages Local API contract stable.
- Move message categories, messages, emotion profiles, and TTS profile persistence to Postgres.
- Update `docs_build/database/dml/messages.sql`, `docs_build/database/seed/messages.json`, and Messages tests.

Suggested validation:
- `git diff --check`
- targeted Messages Local API tests
- `tests/playwright/tools/MessagesTool.spec.mjs`
- no samples unless Messages API behavior is consumed by samples

## 2. Game Journey Metrics Database Cutover

Owner: Team Alpha

Purpose:
- Replace `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`.
- Preserve current Game Journey completion metrics response shape.
- Use Postgres through `GAMEFOUNDRY_DATABASE_URL`.
- Update Game Journey tests that currently assert SQLite engine metadata.

Suggested validation:
- `git diff --check`
- targeted Game Journey Local API tests
- `tests/playwright/tools/GameJourneyTool.spec.mjs`
- no samples unless Game Journey sample behavior is directly affected

## 3. Shared Dev Database Adapter Cleanup

Owner: Master Control assignment required

Purpose:
- Split shared schema/key constants from `src/dev-runtime/persistence/mock-db-store.js`.
- Remove active Local DB/SQLite adapter wording from session metadata.
- Preserve compatibility for current mock repository imports until owner-assigned tool migrations land.

Suggested validation:
- `git diff --check`
- targeted dev-runtime schema tests
- only affected tool Playwright specs whose fixtures import the changed contract

## 4. Local API SQLite Metadata Removal

Owner: Team Gamma coordination, with Alpha/Beta route owners for implementation details

Purpose:
- Remove SQLite imports and constructor wiring from `src/dev-runtime/server/local-api-router.mjs`.
- Remove SQLite database engine metadata after replacement services are live.
- Keep Admin System Health diagnostics Postgres-only.

Suggested validation:
- `git diff --check`
- targeted Local API startup tests
- targeted Admin System Health validation
- targeted Messages and Game Journey validation

## 5. Final Guard Cleanup And Inventory

Owner: Team Gamma

Purpose:
- Update `scripts/validate-browser-env-agnostic.mjs` technical-debt notes after active SQLite removal.
- Run a fresh inventory.
- Confirm remaining SQLite references are only governance docs or archive/reference reports.

Suggested validation:
- `git diff --check`
- targeted static/script validation
- final SQLite inventory report
- no Playwright unless runtime JavaScript changes
- no samples
