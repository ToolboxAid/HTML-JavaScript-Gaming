# PR_26177_001-shared-hash-foundation

## Purpose

Add a small shared non-cryptographic hash foundation.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, and the user request are the source of truth for `PR_26177_001-shared-hash-foundation`.

## Exact Scope

- Add `src/shared/hash/` foundation.
- Include deterministic non-crypto hash helpers.
- No browser-owned product data.
- No runtime UI changes.
- Add targeted tests for the shared hash area.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `src/shared/hash/hash.js`
- `tests/shared/HashFoundation.test.mjs`
- `docs_build/dev/reports/PR_26177_001-shared-hash-foundation.md`
- `docs_build/dev/reports/PR_26177_001-shared-hash-foundation_branch-validation.md`
- `docs_build/dev/reports/PR_26177_001-shared-hash-foundation_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_001-shared-hash-foundation_validation-lane.md`
- `docs_build/dev/reports/PR_26177_001-shared-hash-foundation_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No cryptographic hashing.
- No browser-owned product data.
- No runtime UI changes.
- No browser storage changes.
- No API/database changes.
- No engine refactor.
- No `start_of_day` folder changes.
- No unrelated cleanup.
- No full samples smoke by default.

## Validation

Run exactly:

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/HashFoundation.test.mjs
node --check src/shared/hash/hash.js
node --check tests/shared/HashFoundation.test.mjs
git diff --check
```

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_001-shared-hash-foundation_delta.zip
```
