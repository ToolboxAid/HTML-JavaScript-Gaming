# PR_26177_DELTA_003 Hitboxes Engine Collision Contract Requirement Checklist

| Requirement | Status | Notes |
|---|---|---|
| Add shared collision module | PASS | Added `src/engine/collision/hitboxCollision.js`. |
| Collision logic not page-local | PASS | Logic lives under engine collision source, not Hitboxes page JS. |
| AABB overlap contract | PASS | `aabbOverlap(...)` returns normalized boxes, overlap state, and intersection. |
| Bounding box normalization | PASS | `normalizeBoundingBox(...)` supports negative dimensions and left/top/right/bottom. |
| Swept AABB contract | PASS | `sweptAabb(...)` evaluates moving AABB against target AABB over a delta. |
| Collision time | PASS | Swept result includes `collisionTime`; helper `collisionTime(...)` is exported. |
| Impact normal | PASS | Swept result includes `impactNormal`. |
| Impact point | PASS | Swept result includes `impactPoint`. |
| Before/after positions | PASS | Swept result includes `beforePosition`, `afterPosition`, `startPosition`, and `endPosition`. |
| Regression high-speed vertical impact | PASS | Test covers moving 10x10 box from `0,0` toward target at `0,50` without skipping. |
| Unit tests | PASS | Added `tests/engine/HitboxCollisionContract.test.mjs`. |
| No Hitboxes editor UI | PASS | No UI files changed in this PR. |
| No unrelated tools | PASS | No unrelated tool files changed. |
| No start_of_day folders | PASS | No `start_of_day` files changed. |
| Required reports and ZIP | PASS | Reports and `tmp/PR_26177_DELTA_003-hitboxes-engine-collision-contract_delta.zip` produced. |
