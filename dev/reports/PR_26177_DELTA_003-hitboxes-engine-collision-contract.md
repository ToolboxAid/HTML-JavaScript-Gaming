# PR_26177_DELTA_003-hitboxes-engine-collision-contract

Team: Delta
Branch: PR_26177_DELTA_003-hitboxes-engine-collision-contract
Base: PR_26177_DELTA_002-hitboxes-foundation
Scope: Shared engine collision contract only

## Summary

Added an engine-owned Hitboxes collision contract for future Hitboxes preview/testing and runtime reuse. The logic is shared under `src/engine/collision/` and is not page-local.

## Changes

- Added `src/engine/collision/hitboxCollision.js`.
- Added AABB normalization and overlap helpers.
- Added swept AABB collision calculation with collision time, impact normal, impact point, and before/after/impact positions.
- Added focused unit tests in `tests/engine/HitboxCollisionContract.test.mjs`.

## Deferred

- No Hitboxes editor UI.
- No object source selection.
- No two-object preview UI.
- No swept-motion preview UI.
- No Hitboxes persistence changes.

## Validation

- PASS: `node --check src/engine/collision/hitboxCollision.js`
- PASS: `node --check tests/engine/HitboxCollisionContract.test.mjs`
- PASS: `node ./scripts/run-node-test-files.mjs tests/engine/HitboxCollisionContract.test.mjs`
