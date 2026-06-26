# PR_26177_004-shared-color-foundation

## Purpose

Add a small shared color foundation.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, and the user request are the source of truth for `PR_26177_004-shared-color-foundation`.

## Stack

- Base branch: `PR_26177_003-shared-geometry-foundation`

## Exact Scope

- Add `src/shared/color/` foundation.
- Include hex/rgb/hsl conversion, clamp, lerp/blend helpers, luminance/contrast basics.
- Add targeted tests for the shared color area.
- No page styling changes.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `src/shared/color/color.js`
- `tests/shared/ColorFoundation.test.mjs`
- `docs_build/dev/reports/PR_26177_004-shared-color-foundation.md`
- `docs_build/dev/reports/PR_26177_004-shared-color-foundation_branch-validation.md`
- `docs_build/dev/reports/PR_26177_004-shared-color-foundation_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_004-shared-color-foundation_validation-lane.md`
- `docs_build/dev/reports/PR_26177_004-shared-color-foundation_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No page styling changes.
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
node ./scripts/run-node-test-files.mjs tests/shared/ColorFoundation.test.mjs
node --check src/shared/color/color.js
node --check tests/shared/ColorFoundation.test.mjs
git diff --check
```

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_004-shared-color-foundation_delta.zip
```
