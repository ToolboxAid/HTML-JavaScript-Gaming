# PR_26177_DELTA_053-random-shared-helpers Requirement Checklist

| Requirement | Status | Notes |
|---|---:|---|
| Add `nextInt(randomNext, min, max)` helper | PASS | Added in `src/shared/math/randomHelpers.js`. |
| Add `nextFloat(randomNext, min, max)` helper | PASS | Added in `src/shared/math/randomHelpers.js`. |
| Add `pick(randomNext, array)` helper | PASS | Added in `src/shared/math/randomHelpers.js`. |
| Add `shuffle(randomNext, array)` helper | PASS | Added in `src/shared/math/randomHelpers.js`. |
| Add `chance(randomNext, percent)` helper | PASS | Added in `src/shared/math/randomHelpers.js`. |
| Add `weightedPick(randomNext, weightedItems)` helper | PASS | Added in `src/shared/math/randomHelpers.js`. |
| Helpers consume `randomNext` returning float `>= 0` and `< 1` | PASS | Helpers validate `randomNext` output before use. |
| Do not expose as Creator-facing API | PASS | No UI, tool, or barrel export exposure was added. |
| Do not change existing `RandomSeed` behavior | PASS | `RandomSeed.js` was not changed in this PR; existing test passed. |
| Add targeted unit tests | PASS | Added `tests/shared/RandomHelpers.test.mjs`. |
