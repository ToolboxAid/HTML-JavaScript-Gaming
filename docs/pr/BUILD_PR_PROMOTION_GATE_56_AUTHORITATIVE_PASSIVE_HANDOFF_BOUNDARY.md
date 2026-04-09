# BUILD PR — Promotion Gate Authoritative/Passive Handoff Boundary

## Purpose
Make the authoritative/passive handoff boundary explicit for the promotion-gate lane without widening into replay, timeline, sample, or repo-structure work.

## Exact Target Files
- `src/advanced/promotion/createPromotionGate.js`
- `src/advanced/state/createWorldGameStateSystem.js`
- `src/shared/state/createPromotionStateSnapshot.js`

## Why These Files
This PR stays inside the existing promotion-gate and authoritative-state lane:
- `createPromotionGate.js` is the promotion-gate owner
- `createWorldGameStateSystem.js` is the authoritative world-state system entry
- `createPromotionStateSnapshot.js` is the shared promotion snapshot contract already used in the lane

This PR must not widen beyond these exact files.

## Required Code Changes
1. In `src/advanced/promotion/createPromotionGate.js`
   - make the handoff boundary between passive and authoritative modes explicit
   - ensure the gate names or uses a single handoff decision path
   - preserve current runtime semantics except where needed to remove ambiguous handoff behavior

2. In `src/advanced/state/createWorldGameStateSystem.js`
   - align the world game state system with the explicit handoff path
   - make the minimum authoritative/passive transition boundary readable from the gate-facing integration
   - do not broaden this into general state cleanup

3. In `src/shared/state/createPromotionStateSnapshot.js`
   - update the shared promotion snapshot shape only if required to support the explicit handoff boundary
   - keep this limited to handoff compatibility, not general snapshot redesign

## Hard Constraints
- exact files only
- do not modify replay files
- do not modify timeline files
- do not modify selectors beyond what the exact files already require
- do not modify sample files
- do not modify game files
- do not widen into debug UI work
- do not perform repo-wide state cleanup
- do not change unrelated state semantics

## Validation Steps
- confirm only the exact target files changed
- confirm the promotion gate has a single explicit handoff path
- confirm authoritative vs passive behavior boundary is explicit in the touched code
- confirm imports/exports resolve
- confirm no unrelated refactor or formatting-only churn was introduced

## Acceptance Criteria
- authoritative/passive handoff boundary is explicit
- gate-to-state-system handoff path is singular and readable
- promotion snapshot contract remains coherent with the handoff boundary
- no replay/timeline/sample/game/debug scope expansion occurred
