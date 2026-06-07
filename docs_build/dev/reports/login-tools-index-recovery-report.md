# PR_26158_028 Login Tools Index Recovery Report

## Summary

Recovered local login/session controls and `/tools/...` route aliases without changing CSS, adding UAT/Prod adapters, or touching `start_of_day` folders.

## Artifact

- Delta ZIP: `tmp/PR_26158_028-login-tools-index-recovery_delta.zip`

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Read before edits. |
| Fix Local Mem and Local DB controls grayed out/not clickable. | PASS | `assets/theme-v2/js/login-session.js` keeps mode buttons enabled during normal render and session API diagnostics. `LoginSessionMode.spec.mjs` asserts both buttons are enabled. |
| Preserve Local Mem behavior. | PASS | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` and `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` passed Local Mem scenarios. |
| Preserve SQLite-backed Local DB behind the server API boundary. | PASS | User selection no longer forces Local Mem; LoginSessionMode asserts Local DB mode/persistence remains active after selecting User 2. AdminDbViewer Local DB readonly and unavailable diagnostics passed. |
| Do not add UAT/Prod API adapter behavior. | PASS | No adapter files changed and no UAT/Prod behavior added. |
| Do not expose UAT or Prod as local login choices. | PASS | LoginSessionMode asserts DEV, UAT, and Prod controls are absent. |
| Fix toolbox tool route pages at `tools/**/index.html` rendering no content. | PASS | `tests/helpers/playwrightRepoServer.mjs` maps `/tools/...` browser routes to existing `/toolbox/...` files. `ToolboxRoutePages.spec.mjs` verifies Project Journey, Colors, and Assets route aliases render page content. |
| Do not modify `start_of_day` folders. | PASS | Changed-file list contains no `start_of_day` paths. |
| Run changed-file syntax checks. | PASS | `node --check` passed for all changed JavaScript and test helper/spec files. |
| Run LoginSessionMode Playwright and verify Local Mem and Local DB are enabled/clickable. | PASS | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5 with enabled-button assertions. |
| Run targeted toolbox route/page smoke validation for affected `tools/**/index.html` pages. | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` passed 1/1. |
| Run AdminDbViewer Playwright if login/session/API changes affect DB mode initialization. | PASS | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` passed 7/7. |
| Do not run full samples smoke unless directly impacted. | PASS | Full samples smoke skipped because no samples or shared sample loader/framework changed. |

## Files Changed

- `assets/theme-v2/js/login-session.js`
- `tests/helpers/playwrightRepoServer.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/login-tools-index-recovery-report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/login-session.js` | PASS |
| `node --check tests/helpers/playwrightRepoServer.mjs` | PASS |
| `node --check tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS |
| `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 5/5 |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS, 7/7 |
| `git diff --check` | PASS, with Git line-ending warnings only |

## Notes

- An intermediate run of the new toolbox route smoke failed because the Colors page runtime changes its H1 to `Colors`; the smoke expectation was corrected and the lane reran PASS.
- Playwright regenerated advisory V8 coverage files during targeted runs; those optional artifacts were kept out of this scoped delta because this PR did not require a V8 coverage report.
