# PR_26171_GAMMA_006-sqlite-deprecation-audit

## Summary

Team ownership: GAMMA.

Purpose: audit SQLite references across active repo paths, classify the remaining references, create a removal backlog, and confirm Postgres remains authoritative.

No SQLite code was removed in this PR.

## Start Gate

- Checkout `main`: PASS.
- Pull latest `main`: PASS.
- Verify branch is `main`: PASS.
- Verify clean status before branch creation: PASS.
- Verify PR 005 artifacts do not leave unstaged report changes: PASS.
- Created branch: `pr/26171-GAMMA-006-sqlite-deprecation-audit`.
- Base main commit before branch: `eaee83f93`.

## Audit Method

Commands:
- `rg -l -i "sqlite|better-sqlite3|sqlite3|\.sqlite|\.db\b|node:sqlite|DatabaseSync" -g "!tmp/**" -g "!node_modules/**" -g "!.git/**"`
- `rg --count-matches -i "sqlite|better-sqlite3|sqlite3|\.sqlite|\.db\b|node:sqlite|DatabaseSync" -g "!tmp/**" -g "!node_modules/**" -g "!.git/**"`
- `rg -n -i "SQLite is deprecated|Postgres is authoritative|New database work must target Postgres|Local API -> Postgres|Database Direction|Postgres target|GAMEFOUNDRY_DATABASE_URL must use postgres"`

Excluded generated/dependency paths:
- `tmp/**`
- `node_modules/**`
- `.git/**`

## Classification Summary

| Classification | References | Files | Status |
| --- | ---: | ---: | --- |
| active runtime | 43 | 3 | Legacy SQLite runtime debt remains under `src/dev-runtime/`. |
| local API | 6 | 1 | Local API still exposes or reports SQLite-backed legacy paths. |
| test | 42 | 7 | Targeted tests still create temporary SQLite files or guard against SQLite exposure. |
| docs | 298 | 96 | Historical reports, BUILD docs, database docs, and governance text. |
| archive/reference | 5 | 1 | Deprecated V1/V2 reference material only. |

## Active Runtime References

| File | Count | Classification | Notes |
| --- | ---: | --- | --- |
| `src/dev-runtime/messages/messages-sqlite-service.mjs` | 37 | active runtime | Main remaining server-side SQLite service. Uses `node:sqlite`, `DatabaseSync`, `GAMEFOUNDRY_MESSAGES_SQLITE_PATH`, `messages.sqlite`, and reports `SQLite`. |
| `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs` | 5 | active runtime | Uses `node:sqlite`, `DatabaseSync`, `game-journey-completion-metrics.sqlite`, and reports `SQLite`. |
| `src/dev-runtime/persistence/mock-db-store.js` | 1 | active runtime | Describes Local DB as SQLite-backed server storage. |

## Local API References

| File | Count | Classification | Notes |
| --- | ---: | --- | --- |
| `src/dev-runtime/server/local-api-router.mjs` | 6 | local API | Imports and creates `MessagesSqliteService`, reports `databaseEngine: "SQLite"` for legacy routes, and includes Local DB/SQLite export text. |

## Test References

| File | Count | Classification | Notes |
| --- | ---: | --- | --- |
| `scripts/validate-browser-env-agnostic.mjs` | 10 | test | Static guard rejects browser/provider leakage and documents deprecated SQLite/Local DB technical debt. |
| `tests/dev-runtime/DbSeedIntegrity.test.mjs` | 2 | test | Creates temporary `.sqlite` files under `tmp/local-db`. |
| `tests/playwright/tools/AdminDbViewer.spec.mjs` | 1 | test | Creates temporary Admin DB Viewer `.sqlite` fixture. |
| `tests/playwright/tools/BrowserApiUrlConfig.spec.mjs` | 1 | test | Creates temporary browser API URL config `.sqlite` fixture. |
| `tests/playwright/tools/GameJourneyTool.spec.mjs` | 7 | test | Includes Game Journey Local API SQLite persistence test and direct `node:sqlite` inspection. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | 1 | test | Creates temporary login-session `.sqlite` fixture. |
| `tests/playwright/tools/MessagesTool.spec.mjs` | 20 | test | Uses `GAMEFOUNDRY_MESSAGES_SQLITE_PATH` and temporary messages `.sqlite` fixtures for legacy Messages coverage. |

## Docs References

| Group | References | Files | Classification |
| --- | ---: | ---: | --- |
| `docs_build/dev/PROJECT_INSTRUCTIONS.md` | 7 | 1 | docs |
| `docs_build/dev/reports/` | 270 | 83 | docs |
| `docs_build/pr/` | 18 | 9 | docs |
| `docs_build/database/` | 3 | 3 | docs |

Docs references are historical reports, active governance, or prior BUILD/validation records. They should remain as traceability unless a dedicated docs cleanup PR rewrites obsolete guidance.

## Archive/Reference

| Group | References | Files | Classification |
| --- | ---: | ---: | --- |
| `archive/v1-v2/` | 5 | 1 | archive/reference |

Archive references are retained as deprecated V1/V2 reference material and are not active implementation ownership.

## Postgres Authoritative Confirmation

Postgres remains authoritative.

Evidence:
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` states `SQLite is deprecated.` and `Postgres is authoritative.`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` requires new database work to target Postgres and requires `Local API -> Postgres`.
- `src/dev-runtime/persistence/postgres-connection-client.mjs` rejects non-`postgres://` and non-`postgresql://` database URLs.
- `toolbox/messages/index.html` surfaces `Database Direction: Postgres`.
- `toolbox/messages/messages.js` sets the Messages persistence label to `Postgres target`.

## Removal Backlog

Recommended follow-up PRs:

1. `PR_26171_BETA_0XX-messages-postgres-service-cutover`
   - Owner: Team Beta.
   - Scope: replace `src/dev-runtime/messages/messages-sqlite-service.mjs` with a Postgres-backed Messages service contract.
   - Include migration of Messages categories, emotion profiles, TTS profiles, messages, segments, and playback payload reads.
   - Update `src/dev-runtime/server/local-api-router.mjs` to create the Postgres-backed service instead of `createMessagesSqliteService`.

2. `PR_26171_ALPHA_0XX-game-journey-postgres-metrics-cutover`
   - Owner: Team Alpha.
   - Scope: replace `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs` SQLite storage with Local API -> Postgres persistence.
   - Update Game Journey tests to avoid direct `node:sqlite` inspection.

3. `PR_26171_GAMMA_0XX-local-api-sqlite-diagnostic-cleanup`
   - Owner: Team Gamma.
   - Scope: after Alpha/Beta cutovers, remove Local API `databaseEngine: "SQLite"` reporting and Local DB/SQLite operator wording that no longer reflects active behavior.

4. `PR_26171_GAMMA_0XX-sqlite-test-fixture-retirement`
   - Owner: Team Gamma with Alpha/Beta follow-through where tool ownership applies.
   - Scope: retire temp SQLite fixtures once the owning runtime paths are Postgres-backed.
   - Preserve browser boundary guard checks that ensure no browser code imports database implementation details.

5. `PR_26171_GAMMA_0XX-sqlite-docs-traceability-cleanup`
   - Owner: Team Gamma.
   - Scope: clean obsolete active docs after runtime/test cutovers while preserving historical reports and archive/reference material.

## Validation

Lanes executed:
- docs/static - audit/report-only PR.

Commands run:
- `git diff --check` - PASS.
- Targeted SQLite reference scan - PASS.
- Targeted Postgres authoritative text scan - PASS.

Skipped lanes:
- Playwright: SKIP. Audit/report-only PR with no runtime, UI, toolState, or workspace behavior changes.
- Samples: SKIP. Audit/report-only PR with no sample loader, sample JSON, or sample runtime changes.
- Runtime, integration, and engine: SKIP. No runtime, handoff, shared parser, or engine behavior changed.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_GAMMA_006-sqlite-deprecation-audit.md`
- `docs_build/dev/reports/PR_26171_GAMMA_006-sqlite-deprecation-audit-manual-validation-notes.md`
- `docs_build/dev/reports/PR_26171_GAMMA_006-sqlite-deprecation-audit-instruction-compliance-checklist.md`

## Git Workflow

- Current branch: `pr/26171-GAMMA-006-sqlite-deprecation-audit`.
- Created branch: `pr/26171-GAMMA-006-sqlite-deprecation-audit`.
- Push result: PASS. Pushed `pr/26171-GAMMA-006-sqlite-deprecation-audit` to `origin`.
- PR URL: `https://github.com/ToolboxAid/HTML-JavaScript-Gaming/pull/30`.
- Merge result: not merged; EOD approval required.
