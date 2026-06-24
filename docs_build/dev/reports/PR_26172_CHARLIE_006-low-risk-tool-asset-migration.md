# PR_26172_CHARLIE_006 Low-Risk Tool Asset Migration

## Scope

Move one low-risk tool asset set into canonical structure.

Selected tool:

- Idea Board

Reason selected:

- Single active tool JS file.
- No tool-specific CSS.
- One active HTML script reference.
- One active Playwright route assertion requiring path update.

## Changes

| File | Change |
| --- | --- |
| `toolbox/idea-board/index.js` | Moved to canonical path. |
| `assets/toolbox/idea-board/js/index.js` | Added by move; import path updated for new location. |
| `toolbox/idea-board/index.html` | Updated script source to `assets/toolbox/idea-board/js/index.js`. |
| `tests/playwright/tools/ToolboxRoutePages.spec.mjs` | Updated route assertion to the canonical script source. |

No tool CSS was moved because no Idea Board tool CSS file exists.

## Canonical Path Verification

| Check | Status | Evidence |
| --- | --- | --- |
| JS moved to canonical tool path | PASS | `assets/toolbox/idea-board/js/index.js` exists. |
| CSS move avoided when absent | PASS | No `toolbox/idea-board/*.css` file exists. |
| HTML references canonical JS | PASS | `toolbox/idea-board/index.html` references `assets/toolbox/idea-board/js/index.js`. |
| Old active JS references removed | PASS | Active `toolbox`, `assets`, `tests`, `src`, `scripts`, and `package.json` scan found no `toolbox/idea-board/index.js` references. |
| Runtime behavior intentionally unchanged | PASS | Code body was moved without behavior edits; only relative import path changed. |

## Validation

| Validation | Status | Result |
| --- | --- | --- |
| `node --check assets/toolbox/idea-board/js/index.js` | PASS | Module syntax is valid. |
| Old-path active reference scan | PASS | No active old-path references found. |
| Canonical-path reference scan | PASS | HTML and targeted Playwright assertion reference new path. |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "Idea Board launches from Toolbox" --timeout=180000 --trace=off --output=tmp/test-results/charlie-pr006-idea-board` | FAIL | Test reached the updated script assertion, then failed on `500 /api/game-journey/completion-metrics`. |
| `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --timeout=180000 --trace=off --output=tmp/test-results/charlie-pr006-idea-board-direct` | FAIL | One test failed on `500 /api/game-journey/completion-metrics`; the fallback Idea Board test passed. |

## Validation Stop

Status: STOP.

Reason:

- Targeted Playwright validation did not complete cleanly.
- The failure is the Game Journey completion metrics API returning HTTP 500 during Idea Board flows that navigate through Game Hub/Game Journey behavior.
- The failure is not caused by the canonical script path move, because the new script path assertion passed before the failed request assertion.
- Fixing the Game Journey metrics API or broadening the tests to mock that endpoint is outside this PR's migration-only scope.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Use PR_005 audit | PASS | PR_005 identified Idea Board as the first low-risk candidate. |
| Select only one tool | PASS | Only Idea Board was migrated. |
| Move JS to `assets/toolbox/{tool}/js/index.js` | PASS | Moved to `assets/toolbox/idea-board/js/index.js`. |
| Move CSS only if needed | PASS | No CSS move needed. |
| Update HTML references | PASS | Script path updated. |
| Do not change behavior | PASS | Runtime code moved with only relative import path adjustment. |
| Do not migrate multiple tools | PASS | Only one tool touched. |
| Run targeted validation | FAIL | Playwright validations failed on unrelated `game-journey/completion-metrics` 500. |
| Confirm no broken old JS/CSS references | PASS | Old active path scan passed. |
| Confirm canonical path used | PASS | HTML and test assertion use canonical path. |
| ZIP exists | PASS | `tmp/PR_26172_CHARLIE_006-low-risk-tool-asset-migration_delta.zip` exists. |

## Manual Validation Notes

- This PR is a partial implementation with validation stop.
- The stack should not continue to PR_007 until owner/Codex resolves whether to accept the migration with a known external validation blocker or to fix the Game Journey metrics endpoint in a separate scoped PR.
- No merge to `main` was performed.
