# PR_26177_DELTA_052-random-seed-utility

## Purpose

Add a reusable shared JavaScript `RandomSeed` utility for deterministic seeded random sequences.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, the user request, and `docs_build/dev/ProjectInstructions.zip` are the source of truth for `PR_26177_DELTA_052-random-seed-utility`.

## OWNER Override And Team Assignment

OWNER override approved: Assign Team Delta `PR_26177_DELTA_052-random-seed-utility`.

Team Delta owns Shared JS, runtime utilities, technical debt remediation, and runtime test coverage.

## Exact Scope

- Add reusable shared JavaScript utility class named `RandomSeed`.
- Constructor accepts an initial seed.
- Include:
  - `seed(value)`
  - `next()`
  - `nextInt(min, max)`
  - `nextFloat(min, max)`
  - `pick(array)`
- Same seed must reproduce the same sequence after reseeding.
- Different seeds should produce different sequences.
- Add JSDoc.
- Add targeted unit tests.
- Do not replace existing `Math.random()` usage.
- No UI changes.
- No browser storage.
- No API/database changes.
- No unrelated cleanup.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `docs_build/dev/ProjectInstructions/team_assignments/ACTIVE_TEAM_REGISTRY.md`
- `src/shared/math/RandomSeed.js`
- `tests/shared/RandomSeed.test.mjs`
- `docs_build/dev/reports/PR_26177_DELTA_052-random-seed-utility.md`
- `docs_build/dev/reports/PR_26177_DELTA_052-random-seed-utility_branch-validation.md`
- `docs_build/dev/reports/PR_26177_DELTA_052-random-seed-utility_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_DELTA_052-random-seed-utility_validation-lane.md`
- `docs_build/dev/reports/PR_26177_DELTA_052-random-seed-utility_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_DELTA_052-random-seed-utility_instruction-compliance-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No existing `Math.random()` call-site replacements.
- No UI changes.
- No browser storage changes.
- No API changes.
- No database changes.
- No engine core changes outside the new shared utility.
- No `start_of_day` folder changes.
- No unrelated cleanup.

## Validation

Run exactly:

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/RandomSeed.test.mjs
node --check src/shared/math/RandomSeed.js
node --check tests/shared/RandomSeed.test.mjs
git diff --check
```

Playwright is not required because this PR does not change UI or browser runtime behavior.

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_DELTA_052-random-seed-utility_delta.zip
```
