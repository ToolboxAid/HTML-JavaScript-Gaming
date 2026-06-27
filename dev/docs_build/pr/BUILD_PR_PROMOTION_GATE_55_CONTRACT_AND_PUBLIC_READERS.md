# BUILD PR — Promotion Gate Contract And Public Readers

## Purpose
Make the promotion-gate read boundary explicit and remove local gate-state reading assumptions by routing promotion-gate reads through the shared public reader path.

## Exact Target Files
- `src/advanced/promotion/createPromotionGate.js`
- `src/shared/state/getState.js`
- `src/shared/state/createPromotionStateSnapshot.js`

## Why These Files
Current repo evidence shows:
- `src/advanced/promotion/createPromotionGate.js` contains a local `getState()` function
- `src/shared/state/getState.js` is the shared state-reader file
- `src/shared/state/createPromotionStateSnapshot.js` is the existing shared promotion snapshot file

This PR is limited to those exact files only.

## Required Code Changes
1. In `src/shared/state/getState.js`
   - confirm/export the public reader contract needed by the promotion gate
   - make the reader shape explicit enough that promotion-gate code does not need a private/local `getState()` helper for lane-critical reads

2. In `src/shared/state/createPromotionStateSnapshot.js`
   - align the shared promotion snapshot contract with the public reader shape if required by the exact current implementation
   - keep this limited to promotion-gate contract/read compatibility only

3. In `src/advanced/promotion/createPromotionGate.js`
   - remove or reduce the local gate-specific `getState()` implementation where the shared public reader can be used instead
   - route promotion-gate state reads through the shared public reader path
   - preserve current promotion-gate behavior; this PR is contract/read-boundary work, not a replay/timeline rewrite

## Hard Constraints
- exact files only
- do not modify replay files
- do not modify timeline files
- do not modify sample files
- do not modify game files
- do not widen into debug UI work
- do not rename unrelated exports
- do not perform general state cleanup
- do not change promotion behavior semantics beyond replacing local/private read assumptions with the shared contract path

## Validation Steps
- confirm only the exact target files changed
- confirm `createPromotionGate.js` no longer depends on a lane-critical private/local read path when the shared public reader can be used
- confirm imports/exports resolve
- confirm no unrelated refactor or formatting-only churn was introduced
- confirm the promotion gate still builds/runs with the same behavior surface

## Acceptance Criteria
- promotion-gate read boundary is explicit
- shared public reader path is used for promotion-gate state reads where applicable
- no unnecessary local gate-only `getState()` reader remains for the contract-covered path
- promotion snapshot/read contract remains coherent
- no replay/timeline/sample/game scope expansion occurred
