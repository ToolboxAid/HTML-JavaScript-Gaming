# PLAN_PR: PR_26177_DELTA_055-random-seed-enhancements

## Purpose

Enhance `RandomSeed` with matching procedural convenience methods.

## Owner And Assignment

- Team: Delta
- OWNER override approved: Continue Team Delta random utility stack with `PR_26177_DELTA_055-random-seed-enhancements`.
- Stack base: `PR_26177_DELTA_054-random-utility`.

## Scope

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

## Implementation Plan

1. Update `src/shared/math/RandomSeed.js` to reuse `randomHelpers.js` for procedural helper methods.
2. Keep the existing seeded `next()` algorithm unchanged.
3. Add state save/restore methods.
4. Extend `tests/shared/RandomSeed.test.mjs` with sequence compatibility, new method, and state tests.
5. Produce required PR reports and repo-structured ZIP.

## Acceptance Criteria

- Existing seeded sequence values remain compatible.
- Same seed and reseeding behavior remain deterministic.
- New procedural methods use the same seeded random stream.
- State save/restore resumes the sequence from the saved point.
