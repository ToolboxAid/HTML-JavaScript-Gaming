Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Asteroids Validation Phase 2: Collision + Timing Stress

## Goal
Stress-test the engine using Asteroids gameplay to validate collision correctness, timing stability, and edge-case safety under load.

## In Scope
- `games/Asteroids/`
- tests under `tests/games/` and/or `tests/engine/`
- minimal runtime fixes only if required
- `tests/run-tests.mjs` only if required

## Out of Scope
- promotion/extraction work
- sample consolidation
- UI redesign
- gameplay expansion unrelated to validation

## Required Validation Targets

### 1. Collision stability under load
Validate:
- multiple simultaneous collisions
- bullet vs asteroid
- asteroid vs asteroid (if applicable)
- player vs asteroid edge cases

Ensure:
- no missed collisions
- no duplicate collision processing
- no invalid state transitions

### 2. Wave progression stability
Validate:
- wave completion detection
- asteroid splitting chains
- spawning next wave under stress

Ensure:
- no stuck wave states
- no premature wave transitions

### 3. Respawn and death edge cases
Validate:
- rapid player death sequences
- respawn timing correctness
- safe state after respawn

Ensure:
- no ghost player states
- no duplicated entities
- no invalid collision immediately on spawn

### 4. Timing consistency under stress
Validate:
- consistent update timing under heavy object counts
- no runaway accumulator or timing drift
- stable behavior across variable frame rates

## Allowed Runtime Changes
- Only minimal fixes directly tied to failures found
- No architectural changes
- No hidden promotion

## Tests / Evidence
Add:
- stress tests
- repeated collision simulations
- timing consistency checks

## Acceptance Criteria
- collision system stable under stress
- wave progression reliable
- respawn logic safe
- timing remains consistent
- only minimal fixes applied
