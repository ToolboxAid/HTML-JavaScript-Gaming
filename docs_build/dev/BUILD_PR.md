# PR_26177_DELTA_053-random-shared-helpers

## Purpose

Create shared internal helper logic for random utility operations.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, the user request, and `docs_build/dev/ProjectInstructions.zip` are the source of truth for `PR_26177_DELTA_053-random-shared-helpers`.

## OWNER Override And Team Assignment

OWNER override approved: Continue Team Delta random utility stack with `PR_26177_DELTA_053-random-shared-helpers`.

Team Delta owns Shared JS, runtime utilities, technical debt remediation, and runtime test coverage.

## Exact Scope

- Add internal/shared helper functions for:
  - `nextInt(randomNext, min, max)`
  - `nextFloat(randomNext, min, max)`
  - `pick(randomNext, array)`
  - `shuffle(randomNext, array)`
  - `chance(randomNext, percent)`
  - `weightedPick(randomNext, weightedItems)`
- Helper must consume a `randomNext` function returning float `>= 0` and `< 1`.
- Do not expose this as Creator-facing API.
- Do not change existing `RandomSeed` behavior.
- Add targeted unit tests.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `docs_build/dev/ProjectInstructions/team_assignments/ACTIVE_TEAM_REGISTRY.md`
- `src/shared/math/randomHelpers.js`
- `tests/shared/RandomHelpers.test.mjs`
- `docs_build/dev/reports/PR_26177_DELTA_053-random-shared-helpers.md`
- `docs_build/dev/reports/PR_26177_DELTA_053-random-shared-helpers_branch-validation.md`
- `docs_build/dev/reports/PR_26177_DELTA_053-random-shared-helpers_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_DELTA_053-random-shared-helpers_validation-lane.md`
- `docs_build/dev/reports/PR_26177_DELTA_053-random-shared-helpers_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_DELTA_053-random-shared-helpers_instruction-compliance-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No Creator-facing API exposure.
- No existing `RandomSeed` behavior changes.
- No existing `Math.random()` call-site replacements.
- No UI changes.
- No browser storage changes.
- No API changes.
- No database changes.
- No `start_of_day` folder changes.
- No unrelated cleanup.

## Validation

Run exactly:

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/RandomHelpers.test.mjs tests/shared/RandomSeed.test.mjs
node --check src/shared/math/randomHelpers.js
node --check tests/shared/RandomHelpers.test.mjs
git diff --check
```

Playwright is not required because this PR does not change UI or browser runtime flows.

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_DELTA_053-random-shared-helpers_delta.zip
```
