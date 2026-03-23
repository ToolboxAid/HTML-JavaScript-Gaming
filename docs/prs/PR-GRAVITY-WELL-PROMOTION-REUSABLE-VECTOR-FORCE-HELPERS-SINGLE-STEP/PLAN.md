Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Gravity Well Promotion: Reusable Vector/Force Helpers (Single Step)

## Goal
Extract only the clearly reusable Gravity Well vector/force helpers into the engine in one tightly scoped pass, while keeping all game-specific behavior local.

## Why This Single-Step Promotion Is Safe
Gravity Well has already been:
- built
- tested
- validated for boot/scene flow
- validated for world mechanics
- validated for determinism/timing stability

That means promotion should now be limited to helpers that are:
- already generic by behavior
- not tied to Gravity Well rules or tuning
- demonstrably useful beyond this one game

## In Scope
- `games/GravityWell/`
- `engine/vector/` or another already-established engine utility location only if strictly justified
- focused tests affected by the promotion
- `tests/run-tests.mjs` only if required

## Out of Scope
- engine redesign
- gameplay changes
- UI/win/loss/session extraction
- broad math cleanup
- speculative physics abstraction
- moving game tuning/constants into engine

## Canonical Promotion Rule
Promote only helpers that satisfy all of the following:
1. runtime-neutral
2. deterministic/pure
3. not named or shaped around Gravity Well concepts
4. not dependent on Gravity Well constants, entities, or rules
5. clearly useful to future games/simulations

If a helper fails any of those, keep it local.

## Required Changes

### 1. Identify promotion candidates
Inspect Gravity Well vector/force helpers and classify each candidate as:
- `PROMOTE`
- `KEEP_LOCAL`
- `SPLIT_REQUIRED`

Only `PROMOTE` or the generic half of `SPLIT_REQUIRED` may move.

Examples of likely candidates if present:
- force-from-direction-and-strength style helpers
- vector normalization / add-scale convenience helpers already aligned with engine/vector design
- distance/direction helpers if they add clearly missing generic value without duplicating existing engine utilities

Examples that must stay local:
- gravity tuning constants
- beacon/planet interaction thresholds
- win/loss ordering policy
- ship control feel math that is specific to Gravity Well

### 2. Place promoted helpers carefully
Use the narrowest existing engine location that fits.
Prefer:
- `engine/vector/`
- existing engine utility modules already aligned with the helper purpose

Do not create a brand-new subsystem unless absolutely necessary.

### 3. Adopt promoted helpers in Gravity Well
Update Gravity Well to use the promoted helper(s) while preserving behavior.

### 4. Preserve behavior
No gameplay drift:
- same motion feel
- same gravity interaction
- same determinism behavior
- same world outcomes under existing tests

### 5. Tests / evidence
Add or update focused tests where practical to prove:
- promoted helper behavior is correct
- Gravity Well behavior remains unchanged after adoption

## Acceptance Criteria
- only clearly reusable vector/force helpers are promoted
- game-specific logic remains in Gravity Well
- Gravity Well adopts the promoted helper(s)
- no gameplay behavior changes occur
- no speculative abstraction or engine redesign is introduced
