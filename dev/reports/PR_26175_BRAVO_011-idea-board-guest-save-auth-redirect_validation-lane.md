# PR_26175_BRAVO_011 Validation Lane

Date: 2026-06-24

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check` | PASS | CRLF warnings only for touched Playwright specs. |
| `rg -n "localStorage|sessionStorage" assets/toolbox/idea-board/js/index.js toolbox/idea-board/index.html` | PASS | No runtime matches. |
| `rg -n "<script>|<style|style=|onclick=|onchange=|oninput=|onsubmit=" toolbox/idea-board/index.html assets/toolbox/idea-board/js/index.js` | PASS | No matches. |
| `node scripts/run-node-test-files.mjs tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs` | PASS | 1 file, 2 tests passed. |
| `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --config=tmp/playwright-system-chrome.config.cjs --workers=1 --reporter=list -g "Idea Board guest write actions redirect to sign in before saving data"` | PASS | Guest redirects verified for all scoped write actions. |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --config=tmp/playwright-system-chrome.config.cjs --workers=1 --reporter=list -g "Idea Board launches from Toolbox with accordion table notes model"` | PASS | Idea Board route and V8 coverage path exercised. |
| `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --config=tmp/playwright-system-chrome.config.cjs --workers=1 --reporter=list` | WARN | 3 passed, 1 failed in downstream Game Hub expanded-row expectation: expected 3 child rows, received 2 (`source-idea`, `readiness-output`). This is unrelated legacy drift. |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --config=tmp/playwright-system-chrome.config.cjs --workers=1 --reporter=list` | WARN | 6 passed, 5 failed in unrelated toolbox metadata/route/local-port expectations. The Idea Board launch test passed. |

## Browser Setup Note

- WARN: Default Playwright Chromium was missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- WARN: `npx playwright install chromium` stalled with only partial placeholder files and was stopped.
- PASS: Focused browser validation was rerun with installed Google Chrome through a temporary `tmp/playwright-system-chrome.config.cjs`, then the temp config and `tmp/test-results` were removed.

## Full-Suite Residual Failures

- `ToolboxRoutePages`: expected `Game Hub` route `/toolbox/game-workspace/index.html` not visible.
- `ToolboxRoutePages`: expected toolbox status counts `Planned (28)` and `Beta (6)`; actual `Planned (27)` and `Beta (8)`.
- `ToolboxRoutePages`: Game Crew route run recorded failed requests for shared toolbox metadata modules.
- `ToolboxRoutePages`: local dev port guard expected redirect to port `5501`; page remained on the ephemeral test server port.
- `IdeaBoardTableNotes`: Game Hub row expansion expected `summary`, `source-idea`, and `readiness-output`; rendered `source-idea` and `readiness-output`.

## Result

PASS: BRAVO_011 validation lane passed for scoped guest-save auth redirect behavior.

WARN: Broad legacy Playwright files are not fully green due to unrelated existing drift listed above.
