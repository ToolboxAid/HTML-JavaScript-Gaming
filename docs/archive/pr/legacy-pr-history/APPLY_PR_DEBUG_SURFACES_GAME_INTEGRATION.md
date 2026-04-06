# APPLY_PR_DEBUG_SURFACES_GAME_INTEGRATION

## Purpose
Apply the approved game-integration contract in one focused implementation step.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: implement sample/game integration wiring for debug surfaces.

## Apply Scope
- apply integration in one selected sample/game entry file
- respect debug environment flags
- initialize and dispose debug surfaces via public APIs only
- preserve gameplay/render loop behavior parity when debug disabled

## Execution Order
1. Add/normalize debug flags at sample entry.
2. Wire debug surface init behind flags.
3. Wire update/render calls in deterministic order.
4. Ensure dispose/cleanup path.
5. Validate enabled and disabled mode behavior.

## Hard Rules
- no engine-core changes unless absolutely required
- no unrelated refactors
- keep sample-specific wiring in sample layer
- use existing debug surface public APIs only

## Validation
- syntax checks for touched files
- sample run with debug disabled (parity check)
- sample run with debug enabled (console/overlay functional)
- input behavior remains scoped and stable
