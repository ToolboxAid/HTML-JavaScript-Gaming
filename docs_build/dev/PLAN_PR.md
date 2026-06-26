# PLAN_PR: PR_26177_DELTA_056-shared-validation-assertions

## Purpose

Move generic validation/assertion helpers out of random helper code into a shared validation module.

## Owner And Assignment

- Team: Delta
- OWNER override approved: Continue Team Delta random utility stack with `PR_26177_DELTA_056-shared-validation-assertions`.
- Stack base: `PR_26177_DELTA_055-random-seed-enhancements`.

## Scope

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

## Implementation Plan

1. Add `src/shared/validation/assert.js` with only the required generic assertion helpers.
2. Remove duplicated generic assertions from `src/shared/math/randomHelpers.js`.
3. Import the shared assertions from `randomHelpers.js`.
4. Run targeted random helper, `Random`, and `RandomSeed` tests.
5. Produce required PR reports and repo-structured ZIP.

## Acceptance Criteria

- Existing random helper behavior is preserved.
- Existing `Random` and `RandomSeed` behavior is preserved.
- Public random APIs are unchanged.
- Shared assertion module stays limited to the current reusable validation helpers.
