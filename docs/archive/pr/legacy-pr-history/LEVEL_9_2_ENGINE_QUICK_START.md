Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_9_2_ENGINE_QUICK_START.md

# Level 9.2 Quick Start

## Goal
Compose Spawn + Lifecycle + WorldState + Events without duplicating system logic.

## Minimal Setup
1. Define config:
- spawn rules
- lifecycle limits
- wave/phase table
- event schedules

2. Construct systems:
- `new SpawnSystem(rules)`
- `new LifecycleSystem(config)`
- `new WorldStateSystem(waves)`
- `new EventsSystem(events)`

3. Frame loop orchestration:
- `events.update(context, applyAction)`
- `spawn.update(dt, factory)`
- `entities = lifecycle.update(entities, dt)`
- resolve game-local outcomes
- `transitions = worldState.update(stateInputs)`

4. Handle transitions:
- reconfigure local game adapters
- do not mutate system internals directly

## Validation Checklist
- Deterministic output for identical inputs.
- No renderer/input logic in system classes.
- No duplicated world-system implementations in game folders.
- Game-specific mechanics remain local.
