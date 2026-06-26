# PR_26177_DELTA_056-shared-validation-assertions

## Purpose

Move generic validation/assertion helpers out of random helper code into a shared validation module.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, the user request, and `docs_build/dev/ProjectInstructions.zip` are the source of truth for `PR_26177_DELTA_056-shared-validation-assertions`.

## OWNER Override And Team Assignment

OWNER override approved: Continue Team Delta random utility stack with `PR_26177_DELTA_056-shared-validation-assertions`.

Team Delta owns Shared JS, runtime utilities, technical debt remediation, and runtime test coverage.

## Stack

- Base branch: `PR_26177_DELTA_055-random-seed-enhancements`
- This PR depends on the random helper module from PR_053, `Random` from PR_054, and `RandomSeed` enhancements from PR_055.

## Exact Scope

- Create `src/shared/validation/assert.js`.
- Move generic assertion helpers from random helper code into `assert.js`.
- Include only generic reusable validation functions needed by current random helpers:
  - `assertArray`
  - `assertFiniteNumber`
  - `assertOrderedRange`
- Update random helper code to import from `src/shared/validation/assert.js`.
- Preserve existing `Random` and `RandomSeed` behavior.
- Do not change public API.
- Do not expand into unrelated validation functions yet.
- Add/update targeted unit tests if needed.
- No UI changes.
- No API/database changes.
- No unrelated cleanup.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `docs_build/dev/ProjectInstructions/team_assignments/ACTIVE_TEAM_REGISTRY.md`
- `src/shared/validation/assert.js`
- `src/shared/math/randomHelpers.js`
- `docs_build/dev/reports/PR_26177_DELTA_056-shared-validation-assertions.md`
- `docs_build/dev/reports/PR_26177_DELTA_056-shared-validation-assertions_branch-validation.md`
- `docs_build/dev/reports/PR_26177_DELTA_056-shared-validation-assertions_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_DELTA_056-shared-validation-assertions_validation-lane.md`
- `docs_build/dev/reports/PR_26177_DELTA_056-shared-validation-assertions_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_DELTA_056-shared-validation-assertions_instruction-compliance-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No public API changes.
- No new unrelated validation helpers.
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
node ./scripts/run-node-test-files.mjs tests/shared/RandomHelpers.test.mjs tests/shared/Random.test.mjs tests/shared/RandomSeed.test.mjs
node --check src/shared/validation/assert.js
node --check src/shared/math/randomHelpers.js
git diff --check
```

Playwright is not required because this PR does not change UI or browser runtime flows.

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_DELTA_056-shared-validation-assertions_delta.zip
```
