Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_9_2_ENGINE_USAGE_PATTERNS.md

# Level 9.2 Engine Usage Patterns

## Scope
- Documentation-only guidance for system consumers.
- No runtime or engine code changes.

## System Usage Patterns

### Spawn System
Use when:
- You need deterministic creation cadence by rule.

Pattern:
- Define spawn rules in scene/game config.
- Call `update(dt, factory)` once per frame.
- Keep factory output game-local (entity type, initial state).

Do:
- Keep rule tables configurable.
- Keep creation side effects outside system internals.

Don't:
- Put rendering/input behavior in spawn logic.
- Hardcode game-specific IDs inside engine-layer contracts.

### Lifecycle System
Use when:
- You need reusable movement/expiry/bounds cleanup.

Pattern:
- Configure bounds and lifetime windows per game mode.
- Run after spawn and before collision/state resolution.
- Treat output array as authoritative alive set.

Do:
- Centralize expiry and bounds policy here.
- Tune limits in scene/game config.

Don't:
- Mix scoring/combat outcomes into lifecycle internals.
- Depend on private iteration order.

### World State System
Use when:
- You need phase + progression transitions.

Pattern:
- Define waves/rounds in config.
- Read `getWave()` for current wave setup.
- Call `update(state)` with explicit transition inputs.

Do:
- Keep phase inputs explicit (`spawnDone`, `remainingCount`, etc.).
- React to returned transitions in scene orchestration.

Don't:
- Hide transition conditions in global mutable state.
- Encode game-specific scoring in state system internals.

### Events System
Use when:
- You need deterministic trigger-action scheduling.

Pattern:
- Declare event table with context predicates (`time`, `phase`, `waveIndex`).
- Call `update(context, applyAction)` once per frame.
- Apply actions in scene/game adapters.

Do:
- Separate trigger evaluation from game action implementations.
- Mark one-shot vs repeat explicitly.

Don't:
- Inject renderer/input behavior into event handlers.
- Depend on undocumented side effects.

## Sample Wiring Pattern (Scene Orchestration)
1. Build config tables (waves, spawn rules, lifecycle limits, events).
2. Construct systems once in scene constructor.
3. Per frame order:
- events.update
- spawn.update
- lifecycle.update
- game-specific resolution (collision/scoring)
- worldState.update
4. Handle transition outputs by reconfiguring local adapters only.

## Anti-Patterns
- Duplicating Spawn/Lifecycle/State/Events logic in each game folder.
- Directly mutating system private counters from scenes.
- Embedding game-specific rule names into reusable system contracts.
- Coupling systems to DOM, renderer, or input devices.

## Configuration Ownership
Engine-owned semantics:
- deterministic contracts
- reusable update interfaces

Game/sample-owned configuration:
- wave tables
- progression tuning
- scoring rules
- local adapters and entity schemas
