# PLAN_PR: PR_26177_DELTA_054-random-utility

## Purpose

Add a nondeterministic `Random` utility with the same public convenience API shape as `RandomSeed`.

## Owner And Assignment

- Team: Delta
- OWNER override approved: Continue Team Delta random utility stack with `PR_26177_DELTA_054-random-utility`.
- Stack base: `PR_26177_DELTA_053-random-shared-helpers`.

## Scope

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

## Implementation Plan

1. Add `src/shared/math/Random.js`.
2. Reuse internal helper functions from `src/shared/math/randomHelpers.js`.
3. Add `tests/shared/Random.test.mjs`.
4. Validate crypto preference, Math fallback, utility methods, UUID shape, and absence of seed API.
5. Produce required PR reports and repo-structured ZIP.

## Acceptance Criteria

- `Random` exposes the required static convenience methods.
- `Random` does not expose deterministic seed support.
- `Random` uses `crypto.getRandomValues()` when available.
- `Math.random()` is used only when crypto random values are unavailable.
