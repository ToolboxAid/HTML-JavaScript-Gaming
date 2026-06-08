# PR_26158_038 Login DB Reseed Control Report

## Summary

Added a two-step Reseed control to the login page Local Development Status section. The control uses the existing server API boundary (`/api/mock-db/seed`) and reseeds only the active DB mode: Local Mem or Local DB.

## Files Changed

| File | Change |
| --- | --- |
| `login.html` | Added Local Development Status reseed fields, start/confirm/cancel controls, and visible reseed status text. |
| `assets/theme-v2/js/login-session.js` | Wired reseed UI state, confirmation, cancel, success, failure, and API-unavailable disabled handling. |
| `src/engine/api/mock-db-api-client.js` | Updated seed client context text from Local Mem-specific wording to generic Mock DB seed wording. |
| `src/dev-runtime/server/mock-api-router.mjs` | Updated seed action diagnostics to name Local Mem or Local DB based on the active mode. |
| `tests/dev-runtime/DbSeedIntegrity.test.mjs` | Added independent Local Mem/Local DB reseed API validation. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | Added UI coverage for reseed confirmation, cancel, Local Mem success, Local DB success, and visible failure status. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Read before implementation; applied PR completion, HTML, validation, and ZIP/report rules. |
| Add a Reseed control to the login page Local Development Status section. | PASS | `login.html` adds `data-login-reseed-*` controls inside the Local Development Status card. |
| Require confirmation before reseed executes. | PASS | `login-session.js` only calls `seedMockDb()` from the confirm handler; LoginSessionMode verifies start -> confirm/cancel state. |
| Local Mem reseeds only Local Mem. | PASS | Node reseed test mutates Local DB, reseeds Local Mem, and verifies Local DB remains mutated. |
| Local DB reseeds only Local DB. | PASS | Node reseed test reseeds Local DB separately and verifies Local Mem remains unchanged by that action. |
| Do not reseed both DBs from one action. | PASS | `LocalDevMockDataSource.seed()` persists only the current adapter state; Node test validates both directions. |
| Show active DB mode visibly. | PASS | `data-login-reseed-active-mode`; LoginSessionMode verifies Local Mem and Local DB text. |
| Show reseed target visibly. | PASS | `data-login-reseed-target`; LoginSessionMode verifies Local Mem and Local DB text. |
| Show success visibly. | PASS | LoginSessionMode verifies `Reseed complete for Local Mem...` and `Reseed complete for Local DB...`. |
| Show failure visibly. | PASS | LoginSessionMode forces `/api/mock-db/seed` to return `ok:false` and verifies visible failure text. |
| Show canceled status visibly. | PASS | LoginSessionMode verifies `Reseed canceled for Local Mem.` |
| Preserve real runtime timestamps during reseed. | PASS | `DbSeedIntegrity.test.mjs` reuses runtime timestamp assertions after Local Mem and Local DB reseed. |
| Preserve guest tool samples from PR_26158_037. | PASS | Existing seed integrity test still verifies guest samples for every active tool. |
| Preserve unique per-user seeded data from PR_26158_037. | PASS | Existing seed integrity test still verifies unique user-owned project/tool state keys. |
| Preserve SQLite-backed Local DB behind API boundary. | PASS | Local DB reseed and AdminDbViewer tests access Local DB through `/api/*`; no browser DB implementation imports were added. |
| Do not add fallback behavior. | PASS | Static/API-unavailable behavior remains disabled; reseed controls disable through `renderError()`. |
| Do not add UAT/Prod behavior. | PASS | Login options and seed behavior remain Local Mem / Local DB only. |
| Do not add CSS. | PASS | No CSS files or inline/page-local styles were changed. |

## Validation Results

| Validation | Result |
| --- | --- |
| Changed-file syntax checks | PASS |
| Targeted reseed API/DB validation | PASS, `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` 2/2 |
| LoginSessionMode Playwright | PASS, 6/6 |
| AdminDbViewer Playwright | PASS, 7/7 |
| Changed-file/static validation | PASS |
| Playwright V8 coverage | PASS/WARN advisory report generated |

## Skipped Validation

| Lane | Decision | Reason |
| --- | --- | --- |
| Full samples smoke | SKIP | No sample runtime or loader changed. |
| Full Playwright suite | SKIP | Targeted login, DB Viewer, and reseed API lanes cover this PR scope. |
| ProjectJourneyTool Playwright | SKIP | Project Journey runtime UI was not changed. |
| ToolboxRoutePages Playwright | SKIP | Tool route rendering was not changed. |

## Notes

- The first failure-case Playwright attempt used an intentional HTTP 500 and produced an expected browser resource console error. The test was corrected to use a JSON API failure (`ok:false`) and then passed.
- Existing Node SQLite experimental warnings and seed-only audit fallback diagnostics appeared during validation and did not indicate PR_26158_038 failures.
- The generated V8 coverage report includes advisory entries from the existing stacked HEAD-diff coverage helper; current PR files are listed in `codex_changed_files.txt`.
