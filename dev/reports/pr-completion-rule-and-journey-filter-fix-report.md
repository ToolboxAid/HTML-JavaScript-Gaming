# PR_26157_014 PR Completion Rule And Journey Filter Fix Report

## Summary

Status: PASS

PR_26157_014 adds the PR Completion Rule to `docs_build/dev/PROJECT_INSTRUCTIONS.md` and fixes Project Journey Navigation filters so the Summary Table, Note Tree, Statistics, and Search all use the same selected filter and selected session user scope.

The uploaded screenshot was treated as failure evidence for a filter mismatch: selecting a status filter could still show rows from other statuses in the Note Tree because Project Journey filtered note membership but not the note item payload/counts. The fix now returns filter-scoped items and counts from the Project Journey repository and prevents stale selected notes/items from rehydrating unfiltered rows.

## Requirement Checklist

| Requested Item | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before edits. |
| Add PR Completion Rule to `docs_build/dev/PROJECT_INSTRUCTIONS.md` | PASS | Added `## PR COMPLETION RULE` section. |
| PR not complete until every requested item is implemented, validated, and explicitly marked PASS | PASS | New rule states this directly. |
| Before packaging, Codex must re-read original PR request | PASS | Original PR_26157_014 request was re-read before this report and packaging. |
| Before packaging, Codex must create requirement checklist | PASS | This table is the requirement-by-requirement checklist. |
| Before packaging, Codex must validate each item individually | PASS | Each row includes PASS evidence; targeted runtime/static lanes passed. |
| Before packaging, Codex must fix failures | PASS | The filter mismatch was fixed before packaging; final validation passed. |
| Before packaging, Codex must include PASS/FAIL evidence in PR report | PASS | This report includes explicit PASS evidence for every requested item. |
| Do not package partially completed PRs | PASS | Packaging was deferred until validation and this checklist were complete. |
| Use uploaded screenshot as failure evidence | PASS | Screenshot failure was classified as status-filter row/count leakage in Project Journey. |
| Navigation filters visible data matches selected filter | PASS | `ProjectJourneyTool.spec.mjs` asserts filtered Note Tree statuses and Summary/Statistics counts. |
| Not Started shows no In Progress rows | PASS | Test asserts Not Started tree rows are only `not-started` and not In Progress. |
| In Progress shows only In Progress rows | PASS | Test asserts In Progress tree rows are only `in-progress`. |
| Blocked shows only Blocker rows | PASS | Test asserts User 2 Blocked tree rows are only `blocker`; User 1 has no rows. |
| Decisions shows only Decide rows | PASS | Test asserts Decisions tree rows are only `decide`. |
| Complete shows only Complete rows | PASS | User 1 has no Complete rows; zero-state summary/tree/stat assertions pass. |
| Skipped shows only Skipped rows | PASS | Test asserts Skipped tree rows are only `skipped` when User 2 is selected. |
| Filters apply to Summary Table | PASS | `expectFilteredSummaryRows` validates per-status summary count columns, Open, and Total. |
| Filters apply to Note Tree | PASS | `expectTreeOnlyStatus` and `expectNoTreeRows` validate visible tree rows. |
| Filters apply to Statistics | PASS | Tests assert filtered `Open`, `Total`, and status tile values. |
| Filters apply to Search results | PASS | Search tests assert search is constrained by active filter. |
| Search respects selected filter and selected session user | PASS | User 1 Blocked + Search returns 0; User 2 All/My + Search finds Skipped; User 2 Blocked + Search Skipped returns 0. |
| All Notes + Search searches all records visible to selected session user | PASS | User 2 All Notes + Search Skipped finds Release Readiness only. |
| My Notes + Search searches only selected session user records | PASS | User 2 My Notes + Search Skipped finds User 2's Release Readiness only. |
| Status filter + Search searches only records in that status for selected session user | PASS | User 2 Blocked + Search Skipped returns no records; Skipped + Search Skipped returns one. |
| Selected filter button remains visually clear | PASS | Tests assert `.primary` and `aria-current` on selected filters. |
| If selected note/item no longer matches active filter, deselect or hide consistently | PASS | Filter clicks clear selected summary note; render now returns filtered visible note or null, preventing stale unfiltered note/tree display. |
| Add Playwright assertions for Not Started | PASS | Targeted Project Journey spec asserts Not Started filter tree/status/summary/stat behavior. |
| Add Playwright assertions for Blocked | PASS | Targeted Project Journey spec asserts Blocked filter tree/status/summary/stat/search behavior. |
| Add Playwright assertions for Decisions | PASS | Targeted Project Journey spec asserts Decisions filter tree/status/summary/stat behavior. |
| Add Playwright assertions for In Progress | PASS | Targeted Project Journey spec asserts In Progress filter tree/status/summary/stat behavior. |
| Add Playwright assertions for Complete | PASS | Targeted Project Journey spec asserts Complete zero-state behavior for User 1. |
| Add Playwright assertions for Skipped | PASS | Targeted Project Journey spec asserts Skipped filter/search behavior for User 2. |
| Add Playwright assertions for All Notes | PASS | Targeted Project Journey spec asserts All Notes counts and search scope. |
| Add Playwright assertions for My Notes | PASS | Targeted Project Journey spec asserts My Notes counts and search scope. |
| Add Playwright assertions for System Generated | PASS | Targeted Project Journey spec asserts System Generated selected button, counts, and forge-bot indicators. |
| Verify visible Note Tree rows match selected filter status | PASS | Tests read `data-journey-item-status` from visible tree buttons. |
| Verify Statistics match filtered visible data | PASS | Tests assert aggregate stats after each relevant filter/search. |
| Verify Summary Table counts match filtered visible data | PASS | Tests assert filtered summary status columns, Open, and Total. |
| Include requirement-by-requirement PASS/FAIL checklist in this report | PASS | Present in this report. |
| If any requested item fails, fix it before packaging | PASS | Targeted runtime/static validations passed before packaging. |
| Run changed-file/static validation | PASS | `npm run test:playwright:static` passed. |
| Do not run full samples smoke | PASS | Full samples smoke was skipped per request. |
| Produce required reports | PASS | Required reports and review artifacts were generated. |

## Implementation Notes

- `toolbox/project-journey/project-journey-mock-repository.js`
  - Added filter-scoped item selection so status filters return only matching items and counts.
  - Preserved All Notes, My Notes, and System Generated behavior.
- `toolbox/project-journey/project-journey.js`
  - Added `data-journey-item-status` for testable visible Note Tree status validation.
  - Updated visible note selection to use the already-filtered note object or no note, avoiding stale unfiltered rows.
- `tests/playwright/tools/ProjectJourneyTool.spec.mjs`
  - Added helpers for visible tree status validation and filtered summary count validation.
  - Expanded assertions for every requested Navigation filter and search scope.
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
  - Added the PR Completion Rule after Definition of Done.

## Validation

| Command | Result |
| --- | --- |
| `node --check toolbox/project-journey/project-journey-mock-repository.js` | PASS |
| `node --check toolbox/project-journey/project-journey.js` | PASS |
| `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --reporter=list --workers=1` | PASS, 13/13 |
| `npm run test:playwright:static` | PASS |
| `git diff --check` | PASS, line-ending warnings only |

## Skipped Lanes

- Full samples smoke: SKIP per request.
- Broad Playwright suite: SKIP because PR scope is Project Journey filter/search runtime behavior plus a docs governance rule; targeted Project Journey lane covers the changed runtime surface.

## Manual Test Notes

1. Open `toolbox/project-journey/index.html?project=demo-project` as User 1.
2. Click each Navigation filter and confirm the Note Tree status rows match the selected filter.
3. Confirm Summary Table counts, Statistics tiles, and Search results change with the same selected filter.
4. Switch to User 2 from Admin Mock DB Viewer and verify Blocked + Search `Skipped` returns no rows, while Skipped + Search `Skipped` returns the skipped item.
