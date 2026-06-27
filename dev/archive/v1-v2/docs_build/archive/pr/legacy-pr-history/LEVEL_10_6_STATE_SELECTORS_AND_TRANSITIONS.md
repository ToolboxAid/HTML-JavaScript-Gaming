Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_6_STATE_SELECTORS_AND_TRANSITIONS.md

# Level 10.6 - Selector Patterns and Named Transitions

## Selector Pattern Rules
- Selectors are pure read functions with no side effects.
- Selectors return derived values or immutable snapshots.
- Selectors never expose mutable internal references.
- Selector names describe intent (`selectCurrentPhase`, `selectWaveProgress`, `selectIsRunComplete`).

## Selector Categories
- `selectWorld*` for world-level canonical reads
- `selectGame*` for game/mode/phase reads
- `selectObjective*` for objective snapshots
- `selectScore*` for scoring and reward state
- `selectFlag*` for named flag checks

## Transition Pattern Rules
- Every write uses a named transition id.
- Transition handlers validate input and preconditions.
- Transition handlers emit approved state-change events through Level 10.4 contracts.
- Transition handlers return explicit result envelopes (`ok`, `reason`, `changes`).

## Named Transition Inventory (Initial)
- `transitionGameMode`
- `transitionPhase`
- `advanceWave`
- `applyScoreDelta`
- `updateObjectiveProgress`
- `setWorldFlag`
- `resolveRunOutcome`

## Transition Safety Rules
- Reject unknown transition names.
- Reject invalid payload shapes.
- Reject transitions that violate ownership boundaries.
- Enforce idempotency for replay-sensitive transitions where feasible.

## Anti-Patterns
- direct mutation of nested state outside transition handlers
- selectors that mutate cache/state while reading
- transitions that call renderer/input concerns
- writing shared state from arbitrary event subscribers
