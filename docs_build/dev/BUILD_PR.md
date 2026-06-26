# PR_26177_006-shared-time-foundation

## Purpose

Add a small shared time foundation.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, and the user request are the source of truth for `PR_26177_006-shared-time-foundation`.

## Stack

- Base branch: `PR_26177_005-shared-text-foundation`

## Exact Scope

- Add `src/shared/time/` foundation.
- Include duration formatting, timestamp helpers, debounce/throttle/sleep helpers where safe for shared runtime.
- Add targeted tests for the shared time area.
- No scheduler/runtime behavior changes.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `src/shared/time/time.js`
- `tests/shared/TimeFoundation.test.mjs`
- `docs_build/dev/reports/PR_26177_006-shared-time-foundation.md`
- `docs_build/dev/reports/PR_26177_006-shared-time-foundation_branch-validation.md`
- `docs_build/dev/reports/PR_26177_006-shared-time-foundation_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_006-shared-time-foundation_validation-lane.md`
- `docs_build/dev/reports/PR_26177_006-shared-time-foundation_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No scheduler/runtime behavior changes.
- No browser-owned product data.
- No runtime UI changes.
- No browser storage changes.
- No API/database changes.
- No `start_of_day` folder changes.
- No unrelated cleanup.
- No full samples smoke by default.

## Validation

Run exactly:

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/TimeFoundation.test.mjs
node --check src/shared/time/time.js
node --check tests/shared/TimeFoundation.test.mjs
git diff --check
```

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_006-shared-time-foundation_delta.zip
```
