# PR_26160_082 DB Leftovers Cleanup

Generated: 2026-06-09

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current branch | `main` | `main` | PASS |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Replace hardcoded build-group color `#ff4d4d` | PASS | No active CSS/JS hardcoded usage existed; stale report references were replaced. |
| Use Theme V2 token `--toolbox-group-build-color: var(--red)` | PASS | `assets/theme-v2/css/colors.css` line owns the token and `.toolbox-group-build` / `.tool-group-build` consume it. |
| Audit additional hardcoded occurrences of `#ff4d4d` | PASS | Active source `rg` returned no matches after cleanup; intentional PR report text documents the removed literal. |
| Replace all build-group usages with the Theme V2 token | PASS | Active build group CSS already routes through `--toolbox-group-build-color`; Playwright now validates this. |
| Do not introduce new color constants or duplicate variables | PASS | No new color variable was added; existing Theme V2 token path is used. |
| Use Theme V2 `colors.css` as color SSoT | PASS | `--red` and `--toolbox-group-build-color` remain in `assets/theme-v2/css/colors.css`. |

## Replaced `#ff4d4d` Occurrences

| File | Previous Occurrence | Replacement |
| --- | --- | --- |
| `docs_build/dev/reports/toolbox-group-color-restore-report.md` | Historical requirement evidence said Build/Create was restored to the literal hex value. | Reworded as superseded by PR_26160_082 and points to `--toolbox-group-build-color: var(--red)`. |
| `docs_build/dev/reports/toolbox-group-color-restore-report.md` | Historical color source row named the old `--red` hex. | Replaced with `--toolbox-group-build-color: var(--red)` and current rendered color `rgb(255, 45, 45)`. |
| `docs_build/dev/reports/toolbox-group-color-restore-report.md` | Historical note described a group-specific token set to the old literal. | Replaced with a note that PR_26160_082 keeps Build/Create on the Theme V2 SSoT path. |
| `docs_build/dev/reports/toolbox-group-color-restore-report.md` | Historical validation command searched for the old literal. | Replaced with a token-only audit command. |

No active runtime CSS, JavaScript, HTML, server, or test source used `#ff4d4d` before this PR. The remaining stale occurrences were report text from PR_26160_062; those were reworded to the Theme V2 token path.

## Theme V2 Token Usage Report

| Token / Selector | Source | Status |
| --- | --- | --- |
| `--red: #ff2d2d` | `assets/theme-v2/css/colors.css` | PASS: Theme V2 color SSoT owns the red value. |
| `--toolbox-group-build-color: var(--red)` | `assets/theme-v2/css/colors.css` | PASS: Build group color delegates to `--red`. |
| `.toolbox-group-build` | `assets/theme-v2/css/colors.css` | PASS: Uses `background: var(--toolbox-group-build-color)`. |
| `.tool-group-build` | `assets/theme-v2/css/colors.css` | PASS: Uses `--tool-group-color` and `--tool-group-accent` from `--toolbox-group-build-color`. |
| Toolbox group Playwright | `tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS: Build/Create expected color now matches `--red`, and the test asserts `--toolbox-group-build-color` resolves to `--red`. |

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` | Returned `main`. |
| Active-source hardcoded color audit | PASS | `rg -n "#ff4d4d" assets src toolbox admin tests --glob '!**/node_modules/**'` | No active source matches after cleanup. |
| Theme V2 token audit | PASS | `rg -n -e "--toolbox-group-build-color" -e "--red" -e "toolbox-group-build" -e "tool-group-build" assets/theme-v2/css tests/playwright/tools/ToolboxRoutePages.spec.mjs` | Confirmed Theme V2 token usage and Playwright assertions. |
| Changed-file syntax | PASS | `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs` | Exited 0. |
| Targeted Toolbox Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "toolbox group labels match" --reporter=line` | 1 passed. |
| Static diff validation | PASS | `git diff --check` | No whitespace errors; Git reported expected LF/CRLF warning for the changed Playwright file. |

## Impacted Lanes

- Toolbox group color rendering
- Theme V2 color token validation

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Samples and sample loaders were not changed. |
| Broad Toolbox route suite | The scoped change only updates group color validation; the targeted group-color Playwright test was run. |
| Admin runtime Playwright | Admin runtime behavior was unchanged; Admin relevance was covered by the existing group-color test reading Admin Tool Votes assignments. |

## Manual Test Notes

No separate manual walkthrough was required after the targeted Playwright test. Build/Create group labels now validate against the Theme V2 `--red` value through `--toolbox-group-build-color`.
