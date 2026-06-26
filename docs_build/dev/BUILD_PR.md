# PR_26177_005-shared-text-foundation

## Purpose

Add a small shared text foundation.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, and the user request are the source of truth for `PR_26177_005-shared-text-foundation`.

## Stack

- Base branch: `PR_26177_004-shared-color-foundation`

## Exact Scope

- Add `src/shared/text/` foundation.
- Include safe string helpers such as slugify, casing, truncate, escapeHtml, and normalizeWhitespace.
- Add targeted tests for the shared text area.
- No copy rewrites outside tests/docs.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `src/shared/text/text.js`
- `tests/shared/TextFoundation.test.mjs`
- `docs_build/dev/reports/PR_26177_005-shared-text-foundation.md`
- `docs_build/dev/reports/PR_26177_005-shared-text-foundation_branch-validation.md`
- `docs_build/dev/reports/PR_26177_005-shared-text-foundation_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_005-shared-text-foundation_validation-lane.md`
- `docs_build/dev/reports/PR_26177_005-shared-text-foundation_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No copy rewrites outside tests/docs.
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
node ./scripts/run-node-test-files.mjs tests/shared/TextFoundation.test.mjs
node --check src/shared/text/text.js
node --check tests/shared/TextFoundation.test.mjs
git diff --check
```

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_005-shared-text-foundation_delta.zip
```
