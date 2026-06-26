# PR_26177_DELTA_054-random-utility Requirement Checklist

| Requirement | Status | Notes |
|---|---:|---|
| Add `Random` utility | PASS | Added `src/shared/math/Random.js`. |
| Include `Random.next()` | PASS | Static method added. |
| Include `Random.nextInt(min, max)` | PASS | Static method added using shared helper. |
| Include `Random.nextFloat(min, max)` | PASS | Static method added using shared helper. |
| Include `Random.pick(array)` | PASS | Static method added using shared helper. |
| Include `Random.shuffle(array)` | PASS | Static method added using shared helper. |
| Include `Random.chance(percent)` | PASS | Static method added using shared helper. |
| Include `Random.weightedPick(weightedItems)` | PASS | Static method added using shared helper. |
| Include `Random.uuid()` | PASS | Static RFC 4122 v4 UUID method added. |
| Prefer `crypto.getRandomValues()` when available | PASS | `Random.next()` and `Random.uuid()` use crypto random values when present. |
| Use `Math.random()` only as compatibility fallback | PASS | Fallback path is used only when crypto random values are unavailable. |
| No deterministic seed support in `Random` | PASS | No `seed` method or seed state added. |
| No browser storage | PASS | No storage usage added. |
| No UI changes | PASS | No UI files changed. |
| Add JSDoc | PASS | Added class and public method JSDoc. |
| Add targeted unit tests | PASS | Added `tests/shared/Random.test.mjs`. |
