# PR_26158_029 API Static Route Recovery Report

## Summary

Recovered login/session API route probes, made 404/405 diagnostics actionable, and filtered named browser-extension noise without adding UAT/Prod adapters or changing `start_of_day`.

## Artifact

- Delta ZIP: `tmp/PR_26158_029-api-static-route-recovery_delta.zip`

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Read before edits. |
| Fix `ShowOneChild.js` failing because `ActionableCoachmark` is not defined before use. | PASS | No active repo runtime file contains `ShowOneChild` or `ActionableCoachmark`; extension script failures are filtered by `tests/helpers/browserExtensionNoise.mjs` without defining globals or masking bare repo `ActionableCoachmark` errors. |
| Fix `localDevLoginState` 404 from `gamefoundry-partials.js`. | PASS | `assets/theme-v2/js/gamefoundry-partials.js` now reports actionable local API route diagnostics for 404/405 instead of the generic session failure. |
| Fix `server-api-client.js` 404/405 for local server API calls used by login/session mode. | PASS | `src/engine/api/server-api-client.js` reports actionable 404/405 diagnostics, and `src/dev-runtime/server/mock-api-router.mjs` supports session `HEAD` probes and API `OPTIONS` probes. `ApiStaticRouteRecovery.spec.mjs` verifies no 404/405 for login/session route calls. |
| Ignore browser extension errors from `ch-content-script-dend.js` and `content-script-idle.js` unless repo code is causing global pollution. | PASS | `tests/helpers/browserExtensionNoise.mjs` ignores only named extension script files. Bare repo errors without those script names still fail the lanes. |
| Preserve Local Mem and Local DB clickability. | PASS | `LoginSessionMode.spec.mjs` and `ApiStaticRouteRecovery.spec.mjs` assert both controls are enabled. |
| Preserve SQLite-backed Local DB behind API boundary. | PASS | LoginSessionMode and AdminDbViewer Local DB tests passed. Browser code still calls API clients/server routes only. |
| Do not add UAT/Prod API adapter behavior. | PASS | No adapter behavior added; only session route probe handling and diagnostics changed. |
| Do not expose UAT or Prod as local login choices. | PASS | LoginSessionMode and ApiStaticRouteRecovery assert UAT/Prod buttons are absent. |
| Do not modify `start_of_day` folders. | PASS | Changed-file list contains no `start_of_day` paths. |
| Run changed-file syntax checks. | PASS | All changed JS/spec files passed `node --check`. |
| Run LoginSessionMode Playwright. | PASS | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5. |
| Run targeted local API route validation for login/session endpoints. | PASS | `npx playwright test tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs` passed 1/1. |
| Run ToolboxRoutePages Playwright. | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` passed 1/1. |
| Run AdminDbViewer Playwright if DB route behavior is touched. | PASS | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` passed 7/7 because the API router was touched. |
| Do not run full samples smoke unless directly impacted. | PASS | Full samples smoke skipped because no samples or shared sample loader/framework changed. |

## Files Changed

- `assets/theme-v2/js/gamefoundry-partials.js`
- `src/engine/api/server-api-client.js`
- `src/dev-runtime/server/mock-api-router.mjs`
- `tests/helpers/browserExtensionNoise.mjs`
- `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/api-static-route-recovery-report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/gamefoundry-partials.js` | PASS |
| `node --check src/engine/api/server-api-client.js` | PASS |
| `node --check src/dev-runtime/server/mock-api-router.mjs` | PASS |
| `node --check tests/helpers/browserExtensionNoise.mjs` | PASS |
| `node --check tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs` | PASS |
| `node --check tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS |
| `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS |
| `node --check tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 5/5 |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS, 7/7 |
| `git diff --check` | PASS, with Git line-ending warnings only |

## Notes

- `ShowOneChild.js`, `ch-content-script-dend.js`, and `content-script-idle.js` are not repo-owned active runtime files. The recovery is intentionally limited to test noise filtering for those named extension scripts plus evidence that repo code is not defining or depending on `ActionableCoachmark`.
- Node emitted the standard experimental warning for `node:sqlite` during Playwright lanes; validation passed.
