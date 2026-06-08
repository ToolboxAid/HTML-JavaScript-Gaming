# PR_26158_039 Testing Lane Execution Report

## Lanes Run

| Lane | Command | Result |
| --- | --- | --- |
| Changed-file syntax | `node --check` on `src/dev-runtime/server/mock-api-router.mjs`, moved guest seed files, moved tool repository files, touched Node tests, and touched Playwright specs | PASS |
| Dev-runtime boundary validation | `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs` | PASS, 3/3 |
| DB seed/reseed integrity | `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` | PASS, 2/2 |
| LoginSessionMode Playwright | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 6/6 |
| AdminDbViewer Playwright | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS, 7/7 |
| Palette repository/tool lane | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs` | PASS, 4/4 |
| Asset repository/tool lane | `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs` | PASS, 6/6 |
| ProjectJourneyTool Playwright | `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS, 13/13 after correcting stale test-only expectations for subpixel divider rendering and current User 3 seed table visibility |
| Static import boundary audit | `rg -n "src/dev-runtime\|src\\dev-runtime\|dev-runtime/\|dev-runtime\\" account admin assets toolbox src --glob '!src/dev-runtime/**' --glob '!archive/v1-v2/**' --glob '!docs_build/dev/**' --glob '!tmp/**'` | PASS, no matches |
| Static mock repository audit | `rg -n "from [^\\n]*(mock-repository\|palette-source-mock-db\|palette-workspace-repository)" account admin assets toolbox src --glob '!src/dev-runtime/**' --glob '!archive/v1-v2/**' --glob '!docs_build/dev/**' --glob '!tmp/**'` | PASS, no matches |
| Changed-file/static validation | `git diff --check` | PASS, Git line-ending warnings only |
| Runtime JS V8 coverage | Playwright coverage from targeted runs | PASS/WARN; generated `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `coverage_changed_js_guardrail.txt` |

## Requirement Evidence

| Requirement | Evidence | Result |
| --- | --- | --- |
| Dev-only mock repositories moved into `src/dev-runtime/persistence/`. | `src/dev-runtime/persistence/tool-repositories/*-mock-repository.js`; retired toolbox files deleted. | PASS |
| Guest/local seed data moved into `src/dev-runtime/guest-seeds/`. | `src/dev-runtime/guest-seeds/palette-source-mock-db.js`; `src/dev-runtime/guest-seeds/tool-state-samples.js`. | PASS |
| Active tools consume runtime contracts only and do not import `src/dev-runtime` directly. | Static audit returned no matches under active browser/tool roots. | PASS |
| UAT/PROD candidate browser surfaces do not import `src/dev-runtime`. | `tests/dev-runtime/DevRuntimeBoundary.test.mjs` checks `account`, `admin`, `assets`, `src/engine`, `src/shared`, and `toolbox`. | PASS |
| Local Mem, guest seeds, test fixtures, and reseed behavior originate from `src/dev-runtime`. | `mock-api-router.mjs` imports `createServerSeedTables()` from `../guest-seeds/tool-state-samples.js`; `DbSeedIntegrity` confirms independent reseed behavior. | PASS |
| SQLite-backed Local DB remains behind API boundary. | AdminDbViewer Local DB readonly test passed through API-backed page flow. | PASS |
| Independent Local Mem and Local DB reseed behavior preserved. | `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs`; LoginSessionMode reseed coverage. | PASS |

## Validation Notes

- One intermediate ProjectJourneyTool run failed on stale test assertions: Chromium reported a 1px divider as `0.8px`, and User 3 now correctly references `tool_state_samples` from current seed integrity requirements. Product code was not changed for this; final ProjectJourneyTool passed 13/13.
- Node and Playwright runs emitted existing Node SQLite experimental warnings and existing seed-only audit fallback diagnostics. These did not fail validation.
- V8 coverage is advisory. Server/dev-runtime modules are not browser-collected by Chromium V8 coverage, so the coverage report lists them as WARN while Node and Playwright lanes exercised the moved server-side code.

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| Full samples smoke | SKIP | No shared sample loader/framework or sample runtime was changed. |
| Full Playwright suite | SKIP | The requested login, DB viewer, reseed, and dev-runtime boundary surfaces were covered by targeted lanes. |
