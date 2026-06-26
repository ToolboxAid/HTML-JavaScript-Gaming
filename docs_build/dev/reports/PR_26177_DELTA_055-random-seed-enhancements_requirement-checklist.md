# PR_26177_DELTA_055-random-seed-enhancements Requirement Checklist

| Requirement | Status | Notes |
|---|---:|---|
| Update `RandomSeed` to use shared helper logic where appropriate | PASS | `nextInt`, `nextFloat`, `pick`, and new methods use `randomHelpers.js`. |
| Add `shuffle(array)` | PASS | Added seeded shuffle method. |
| Add `chance(percent)` | PASS | Added seeded chance method. |
| Add `weightedPick(weightedItems)` | PASS | Added seeded weighted pick method. |
| Add `saveState()` | PASS | Added serializable state capture. |
| Add `restoreState(state)` | PASS | Added state restore with validation. |
| Preserve existing `RandomSeed` sequence compatibility | PASS | Hardcoded `RandomSeed(42)` sequence check passes. |
| Same seed still reproduces same sequence | PASS | Existing targeted test still passes. |
| Reseeding still reproduces same sequence | PASS | Existing targeted test still passes. |
| Add targeted unit tests for new methods | PASS | Extended `tests/shared/RandomSeed.test.mjs`. |
| No adoption changes in existing game logic | PASS | No game logic call sites changed. |
| No UI changes | PASS | No UI files changed. |
