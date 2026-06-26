# PR_26177_DELTA_055-random-seed-enhancements

## Purpose

Enhance `RandomSeed` with matching procedural convenience methods.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, the user request, and `docs_build/dev/ProjectInstructions.zip` are the source of truth for `PR_26177_DELTA_055-random-seed-enhancements`.

## OWNER Override And Team Assignment

OWNER override approved: Continue Team Delta random utility stack with `PR_26177_DELTA_055-random-seed-enhancements`.

Team Delta owns Shared JS, runtime utilities, technical debt remediation, and runtime test coverage.

## Stack

- Base branch: `PR_26177_DELTA_054-random-utility`
- This PR depends on the shared helper module from PR_053 and the stack context from PR_054.

## Exact Scope

- Update `RandomSeed` to use shared helper logic where appropriate.
- Add:
  - `shuffle(array)`
  - `chance(percent)`
  - `weightedPick(weightedItems)`
  - `saveState()`
  - `restoreState(state)`
- Preserve existing `RandomSeed` sequence compatibility.
- Same seed must still reproduce same sequence.
- Reseeding must still reproduce same sequence.
- Add targeted unit tests for new methods.
- No adoption changes in existing game logic.
- No UI changes.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `docs_build/dev/ProjectInstructions/team_assignments/ACTIVE_TEAM_REGISTRY.md`
- `src/shared/math/RandomSeed.js`
- `tests/shared/RandomSeed.test.mjs`
- `docs_build/dev/reports/PR_26177_DELTA_055-random-seed-enhancements.md`
- `docs_build/dev/reports/PR_26177_DELTA_055-random-seed-enhancements_branch-validation.md`
- `docs_build/dev/reports/PR_26177_DELTA_055-random-seed-enhancements_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_DELTA_055-random-seed-enhancements_validation-lane.md`
- `docs_build/dev/reports/PR_26177_DELTA_055-random-seed-enhancements_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_DELTA_055-random-seed-enhancements_instruction-compliance-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No seeded `next()` algorithm changes.
- No existing game logic adoption changes.
- No UI changes.
- No browser storage changes.
- No API changes.
- No database changes.
- No `start_of_day` folder changes.
- No unrelated cleanup.

## Validation

Run exactly:

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/RandomSeed.test.mjs tests/shared/RandomHelpers.test.mjs
node --check src/shared/math/RandomSeed.js
node --check tests/shared/RandomSeed.test.mjs
git diff --check
```

Playwright is not required because this PR does not change UI or browser runtime flows.

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_DELTA_055-random-seed-enhancements_delta.zip
```
