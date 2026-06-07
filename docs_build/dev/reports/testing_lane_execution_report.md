# Testing Lane Execution Report

PR: PR_26157_014-pr-completion-rule-and-journey-filter-fix

## Impacted Lanes

- docs governance rule update
- Project Journey Navigation filter runtime
- Project Journey Summary Table / Note Tree / Statistics consistency
- Project Journey Search filtered by active Navigation state and selected session user
- changed-file/static validation

## Commands Run

| Command | Result |
| --- | --- |
| `node --check toolbox/project-journey/project-journey-mock-repository.js` | PASS |
| `node --check toolbox/project-journey/project-journey.js` | PASS |
| `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --reporter=list --workers=1` | PASS, 13/13 |
| `npm run test:playwright:static` | PASS |
| `git diff --check` | PASS, line-ending warnings only |
| `rg -n "PR COMPLETION RULE\|A PR is not complete\|Codex must not package partially completed PRs" docs_build/dev/PROJECT_INSTRUCTIONS.md` | PASS |

## Behavior Covered

- Not Started filter shows only Not Started rows and zero In Progress rows.
- In Progress filter shows only In Progress rows.
- Blocked filter shows only Blocker rows.
- Decisions filter shows only Decide rows.
- Complete and Skipped zero-state behavior is correct for User 1.
- Skipped filter shows only Skipped rows for User 2.
- All Notes, My Notes, and System Generated filters keep visible buttons clear.
- Summary Table status counts, Open, and Total match filtered visible rows.
- Note Tree rows expose and match filtered status values.
- Search respects selected filter and selected session user.
- Stale selected notes/items do not rehydrate unfiltered tree rows after a filter/search change.

## Skipped Lanes

- Full samples smoke: SKIP per request.
- Broad Playwright suite: SKIP because the affected runtime surface is Project Journey; targeted Project Journey runtime/search/filter coverage passed.

## Notes

- The screenshot failure was reproduced as a filter consistency bug in the Project Journey data/render path: filtered notes still carried unfiltered items/counts.
- The repository now scopes note items/counts by active filter before the UI renders Summary Table, Note Tree, Statistics, or Search results.
