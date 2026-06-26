# PR_26177_DELTA_054-random-utility

## Purpose

Add a nondeterministic `Random` utility with the same public convenience API shape as `RandomSeed`.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, the user request, and `docs_build/dev/ProjectInstructions.zip` are the source of truth for `PR_26177_DELTA_054-random-utility`.

## OWNER Override And Team Assignment

OWNER override approved: Continue Team Delta random utility stack with `PR_26177_DELTA_054-random-utility`.

Team Delta owns Shared JS, runtime utilities, technical debt remediation, and runtime test coverage.

## Stack

- Base branch: `PR_26177_DELTA_053-random-shared-helpers`
- This PR depends on the internal random helper module from PR_053.

## Exact Scope

- Add `Random` utility.
- Include:
  - `Random.next()`
  - `Random.nextInt(min, max)`
  - `Random.nextFloat(min, max)`
  - `Random.pick(array)`
  - `Random.shuffle(array)`
  - `Random.chance(percent)`
  - `Random.weightedPick(weightedItems)`
  - `Random.uuid()`
- Prefer `crypto.getRandomValues()` when available.
- Use `Math.random()` only as compatibility fallback.
- No deterministic seed support in `Random`.
- No browser storage.
- No UI changes.
- Add JSDoc.
- Add targeted unit tests.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `docs_build/dev/ProjectInstructions/team_assignments/ACTIVE_TEAM_REGISTRY.md`
- `src/shared/math/Random.js`
- `tests/shared/Random.test.mjs`
- `docs_build/dev/reports/PR_26177_DELTA_054-random-utility.md`
- `docs_build/dev/reports/PR_26177_DELTA_054-random-utility_branch-validation.md`
- `docs_build/dev/reports/PR_26177_DELTA_054-random-utility_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_DELTA_054-random-utility_validation-lane.md`
- `docs_build/dev/reports/PR_26177_DELTA_054-random-utility_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_DELTA_054-random-utility_instruction-compliance-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No deterministic seed support in `Random`.
- No existing game logic adoption changes.
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
node ./scripts/run-node-test-files.mjs tests/shared/Random.test.mjs tests/shared/RandomHelpers.test.mjs
node --check src/shared/math/Random.js
node --check tests/shared/Random.test.mjs
git diff --check
```

Playwright is not required because this PR does not change UI or browser runtime flows.

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_DELTA_054-random-utility_delta.zip
```
