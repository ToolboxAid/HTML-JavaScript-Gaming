# PR_26177_002-shared-noise-foundation

## Purpose

Add a small shared deterministic noise foundation.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, and the user request are the source of truth for `PR_26177_002-shared-noise-foundation`.

## Stack

- Base branch: `PR_26177_001-shared-hash-foundation`
- This PR builds on PR_001 hash utilities.

## Exact Scope

- Add `src/shared/noise/` foundation.
- Build on existing `Random`/`RandomSeed` and PR_001 hash utilities.
- Include deterministic Value, Perlin-style, Simplex-style, and Fractal-style helpers only where practical.
- Keep API small and documented.
- Add targeted tests for the shared noise area.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `src/shared/noise/noise.js`
- `tests/shared/NoiseFoundation.test.mjs`
- `docs_build/dev/reports/PR_26177_002-shared-noise-foundation.md`
- `docs_build/dev/reports/PR_26177_002-shared-noise-foundation_branch-validation.md`
- `docs_build/dev/reports/PR_26177_002-shared-noise-foundation_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_002-shared-noise-foundation_validation-lane.md`
- `docs_build/dev/reports/PR_26177_002-shared-noise-foundation_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

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
node ./scripts/run-node-test-files.mjs tests/shared/NoiseFoundation.test.mjs tests/shared/HashFoundation.test.mjs
node --check src/shared/noise/noise.js
node --check tests/shared/NoiseFoundation.test.mjs
git diff --check
```

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_002-shared-noise-foundation_delta.zip
```
