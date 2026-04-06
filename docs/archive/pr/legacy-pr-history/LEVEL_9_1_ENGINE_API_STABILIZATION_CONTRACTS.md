Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_9_1_ENGINE_API_STABILIZATION_CONTRACTS.md

# Level 9.1 Engine API Stabilization Contracts

## Systems
- Spawn System
- Lifecycle System
- World State System
- Events System

## Public Contracts

### Spawn System
Public surface:
- `constructor(rules)`
- `update(dt, factory)`

Contract:
- `rules` is an array of deterministic spawn rules.
- `update` must return an array of created payloads in rule-processing order.
- `factory` receives `(rule, count)` and returns one creation payload or null/undefined.

Private boundary:
- rule timing counters (`elapsed`, `count`) are internal state.
- clamping/sanitization details are internal.

### Lifecycle System
Public surface:
- `constructor(config)`
- `update(entities, dt)`

Contract:
- returns filtered/updated entity array.
- applies reusable lifecycle semantics: motion integration, bounds handling, expiry, max-entity cap.

Private boundary:
- internal filter order and intermediate data structures.
- internal movement/expiry evaluation steps.

### World State System
Public surface:
- `constructor(waves)`
- `getWave()`
- `update(state)`

Contract:
- phase transitions are deterministic (`idle`, `spawning`, `active`, `complete`).
- `update` returns transition labels for orchestration.

Private boundary:
- internal transition bookkeeping and counter semantics.
- phase storage internals.

### Events System
Public surface:
- `constructor(events)`
- `update(context, applyAction)`

Contract:
- trigger evaluation is deterministic using explicit context (`elapsed`, `phase`, `waveIndex`).
- one-shot and repeating behavior is respected per event flags.

Private boundary:
- fired-state tracking and event loop internals.
- match-evaluation ordering details (except deterministic behavior guarantee).

## Public vs Private Boundary Table
| system | public API | private implementation boundary |
|---|---|---|
| Spawn | ctor + `update(dt, factory)` | counters, clamping internals, rule iteration internals |
| Lifecycle | ctor + `update(entities, dt)` | filter order internals, transform pipeline details |
| World State | ctor + `getWave()` + `update(state)` | transition bookkeeping internals |
| Events | ctor + `update(context, applyAction)` | fired-flag bookkeeping, trigger-loop internals |

## Configuration Ownership Table
| ownership | allowed content |
|---|---|
| engine system layer | reusable contracts, deterministic semantics, generic orchestration |
| sample/game layer | wave tables, spawn patterns, event schedules, scoring rules, difficulty tuning, adapters |

## Forbidden Coupling Patterns
- Rendering calls from system classes.
- Input polling/DOM/event listeners in system classes.
- Game-specific names/logic in engine system contracts.
- Hidden dependencies on scene globals or renderer state.
- Forked duplicate copies of promoted systems in game/sample folders.

## Migration Notes for Current Games
- Asteroids:
  - keep targeting, collision scoring, and ship behavior scene-local.
  - use promoted systems only through stable public methods.
- Space Invaders:
  - keep formation motion, shot rules, and score rules scene-local.
  - schedule UFO/tempo changes via Events config.
- Pacman Lite:
  - keep maze/chase/collection/life rules scene-local.
  - drive frightened/bonus/tempo through Events config.

## Compatibility Notes
- Existing sample-level wrappers/adapters remain valid if they do not bypass public contracts.
- Migration to engine-owned implementations should preserve constructor/update signatures.
