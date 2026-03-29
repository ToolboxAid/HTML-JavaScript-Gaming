Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_1_ADAPTIVE_SPAWN_DIRECTOR_SPEC.md

# Level 10.1 Adaptive Spawn Director Spec

## Purpose
Define the first advanced optional system, Adaptive Spawn Director, as a composable layer that adjusts spawn pacing through public APIs only.

## Role
Adaptive Spawn Director is an optional pacing controller that:
- observes safe game-state signals
- computes difficulty or pacing multipliers
- influences spawn cadence and timing envelopes

It does not replace Spawn, World State, or Events.

## Public Integration Points

### Inputs
- current phase from World State public contract
- current wave/config from `getWave()`
- safe scene-owned state signals such as:
  - remaining entity count
  - elapsed round time
  - player pressure metrics already owned by game layer
  - event-driven difficulty flags already exposed through scene adapters

### Outputs
- adjusted spawn interval multiplier
- adjusted spawn limit envelope
- optional pacing state for scene-local debugging or telemetry

### Required Boundaries
- Adaptive Spawn Director may influence spawn rules only through public configuration/application paths.
- Adaptive Spawn Director may not mutate private Spawn counters directly.
- Adaptive Spawn Director may not read private World State internals.
- Adaptive Spawn Director may not dispatch Events internally; it may only react to scene-owned event outcomes.

## Public Contract Shape
Recommended minimal public surface:
- `constructor(config)`
- `update(context)`
- `getDirectives()`

Recommended directive payload:
- `spawnIntervalMultiplier`
- `spawnLimitAdjustment`
- `intensityTier`

This keeps the director optional and composable without forcing changes into existing core APIs.

## Determinism Rules
- identical input context must produce identical directives
- no hidden timers outside explicit context/config
- no renderer/input dependencies

## Ownership Rules
Engine-owned, if promoted later:
- generic pacing semantics
- directive computation rules
- deterministic contract

Game/sample-owned:
- pressure metrics
- game-specific difficulty tables
- mapping of directives into exact spawn-rule changes
- genre-specific pacing policies
