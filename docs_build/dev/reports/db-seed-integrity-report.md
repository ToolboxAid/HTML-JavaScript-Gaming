# PR_26158_037 DB Seed Integrity Report

## Executive Summary

Local DB and Local Mem seed creation now use runtime-generated timestamps for createdAt and updatedAt instead of hardcoded 2026 seed anchors.

The server seed snapshot now includes a standalone `tool_state_samples` table. Guest rows are generated from the active toolbox registry so every available tool has a loadable starter toolState/sample row. User rows provide unique user-owned project/toolState seed records for User 1, User 2, User 3, and Admin without storing Guest as a DB user.

## Implementation

| Area | Change | Evidence |
| --- | --- | --- |
| Shared mock DB schema | Added `tool_state_samples` schema and standalone ownership. | `src/dev-runtime/persistence/mock-db-store.js` |
| Runtime timestamps | Replaced fixed 2026 seed timestamp helpers with runtime timestamp generation in shared DB, Palette, Asset, and Project Journey seed helpers. | `src/dev-runtime/persistence/mock-db-store.js`; `toolbox/colors/palette-workspace-repository.js`; `toolbox/assets/assets-mock-repository.js`; `toolbox/project-journey/project-journey-mock-repository.js` |
| Server seed table | Added server-side `tool_state_samples` rows for guest active-tool starters and unique human-user seed rows. | `src/dev-runtime/server/mock-api-router.mjs` |
| DB Viewer visibility | Added a standalone `Tool State Samples` filter label and userKey relationship diagnostics. | `src/engine/api/mock-db-viewer-ui.js` |
| Validation | Added targeted Node seed integrity test and extended Admin DB Viewer Playwright. | `tests/dev-runtime/DbSeedIntegrity.test.mjs`; `tests/playwright/tools/AdminDbViewer.spec.mjs` |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation and validation. | PASS |
| When creating/initializing the Local DB, use real runtime timestamps for `createdAt` and `updatedAt`. | Shared DB, server seed, Palette, Asset, and Project Journey seed helpers use `Date.now()` / `new Date()` runtime timestamps. Node and Playwright validate runtime parseable timestamps. | PASS |
| Remove hardcoded seed timestamps from DB creation paths. | Targeted `rg` search found no active hardcoded `Date.UTC(2026)`, fixed `const now = "2026..."`, or old hardcoded seed timestamp in touched seed paths. | PASS |
| Verify guest seed data includes at least one loadable sample/toolState for every available tool. | `tool_state_samples` guest rows are built from `getActiveToolRegistry()` and validated against `/api/toolbox/registry/snapshot`. | PASS |
| Verify each seeded user has unique projects, tool states, manifests, or sample data where user-owned data exists. | User 1, User 2, User 3, and Admin have unique `projectKey`, `toolStateKey`, `manifestPath`, and `sampleLabel` rows. | PASS |
| Do not share mutable seeded records across users. | Validation verifies separate user-owned seed rows with unique project/toolState keys. | PASS |
| Preserve audit fields: `key`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`. | Table schemas include audit fields; AdminDbViewer audit diagnostics and Node test validate fields and user references. | PASS |
| Preserve SQLite-backed Local DB behind API boundary. | Local DB mode is selected through `/api/session/mode`; AdminDbViewer reads through `/api/mock-db/snapshot`; no browser DB imports were added. | PASS |
| Do not add UAT/Prod behavior. | No UAT/Prod adapter or login behavior changed. | PASS |
| Run changed-file syntax checks. | All changed JS/MJS/spec files passed `node --check`. | PASS |
| Run targeted DB seed integrity validation. | `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` passed 1/1. | PASS |
| Run AdminDbViewer Playwright to verify timestamps, guest samples, and user-unique records are visible. | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` passed 7/7 with new visible `tool_state_samples` checks. | PASS |
| Run LoginSessionMode Playwright if login/session seed behavior is touched. | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Do not run full samples smoke unless directly impacted. | Full samples smoke skipped because sample runtime/loader files were not changed. | PASS |
| Required reports and review artifacts generated. | This report, `testing_lane_execution_report.md`, V8 coverage, review diff, changed files, and ZIP artifact generated. | PASS |

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check src/dev-runtime/persistence/mock-db-store.js` | PASS |
| `node --check src/dev-runtime/server/mock-api-router.mjs` | PASS |
| `node --check src/engine/api/mock-db-viewer-ui.js` | PASS |
| `node --check toolbox/colors/palette-workspace-repository.js` | PASS |
| `node --check toolbox/assets/assets-mock-repository.js` | PASS |
| `node --check toolbox/project-journey/project-journey-mock-repository.js` | PASS |
| `node --check tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS |
| `node --check tests/dev-runtime/DbSeedIntegrity.test.mjs` | PASS |
| `rg -n 'Date\.UTC\(2026\|const now = "2026\|2026-06-06T09:00:00\.000Z' src/dev-runtime toolbox tests/dev-runtime tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS, no matches |
| `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS, 7/7 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 5/5 |
| `git diff --check` | PASS, with Git line-ending warnings only |

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| Full samples smoke | SKIP | No sample loader/framework or sample runtime files changed. |
| Full Playwright suite | SKIP | Targeted AdminDbViewer, LoginSessionMode, and Node seed integrity validations cover the changed DB seed paths. |
| ToolboxRoutePages Playwright | SKIP | Tool page routing was not changed. |
| ProjectJourneyTool Playwright | SKIP | Project Journey UI behavior was not changed; seed timestamp behavior is validated through DB seed/API and Admin DB Viewer. |

## Notes

- No CSS was added.
- Guest remains unauthenticated and is not stored in the `users` table.
- Existing SQLite experimental warnings and seed-only audit fallback diagnostics appeared during validation; they are existing runtime diagnostics and did not affect the PR requirement results.
- V8 coverage warnings for dev-runtime/server and repository files are advisory only; the affected server seed behavior is covered by Node and API-backed Playwright validation.
