# PR_26177_003-shared-geometry-foundation

## Purpose

Add a small shared geometry foundation.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, and the user request are the source of truth for `PR_26177_003-shared-geometry-foundation`.

## Stack

- Base branch: `PR_26177_002-shared-noise-foundation`

## Exact Scope

- Add `src/shared/geometry/` foundation.
- Include small reusable primitives/helpers such as vectors, rectangles, bounds, distance, clamp/intersection basics.
- Add targeted tests for the shared geometry area.
- No engine refactor.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `src/shared/geometry/geometry.js`
- `tests/shared/GeometryFoundation.test.mjs`
- `docs_build/dev/reports/PR_26177_003-shared-geometry-foundation.md`
- `docs_build/dev/reports/PR_26177_003-shared-geometry-foundation_branch-validation.md`
- `docs_build/dev/reports/PR_26177_003-shared-geometry-foundation_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_003-shared-geometry-foundation_validation-lane.md`
- `docs_build/dev/reports/PR_26177_003-shared-geometry-foundation_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No engine refactor.
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
node ./scripts/run-node-test-files.mjs tests/shared/GeometryFoundation.test.mjs
node --check src/shared/geometry/geometry.js
node --check tests/shared/GeometryFoundation.test.mjs
git diff --check
```

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_003-shared-geometry-foundation_delta.zip
```
