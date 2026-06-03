Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_2_ADVANCED_AI_BEHAVIOR_SPEC.md

# Level 10.2 Advanced AI Behavior Spec

## Purpose
Define Advanced AI Behavior System as an optional composition layer that adds reusable behavior modes without changing or duplicating core world systems.

## Role
Advanced AI Behavior System is responsible for:
- evaluating safe game-state inputs
- selecting behavior modes
- computing behavior directives for local game adapters
- coordinating state-driven AI transitions

It is not responsible for:
- rendering
- input
- spawning
- lifecycle cleanup
- world-state progression
- event dispatch

## Public Integration Points

### Inputs
- phase and wave information from World State public APIs
- safe event outcomes already surfaced through scene adapters
- entity-local or group-local context owned by the game/sample layer
- optional timers or pressure metrics passed explicitly in context

### Outputs
- behavior mode label
- behavior directives
- transition hints for local adapters

### Recommended Public Surface
- `constructor(config)`
- `update(context)`
- `getBehaviorState()`

Recommended directive payload:
- `mode`
- `targetingPolicy`
- `movementBias`
- `aggressionMultiplier`
- `avoidanceMultiplier`

## Determinism Rules
- identical input context must produce identical directives
- timer windows must come from explicit config or explicit context
- no hidden dependencies on scene globals, renderer state, or input state

## Composition Rules
- may consume Events outcomes through scene-local adapters
- may read phase/wave through World State public contract
- may coordinate with Lifecycle-owned motion semantics by producing directives only
- must not bypass or mutate core private internals

## Ownership Rules
Engine-owned, if promoted later:
- generic behavior-pattern semantics
- deterministic transition logic
- reusable directive contract

Game/sample-owned:
- exact enemy archetypes
- target selection details
- collision and scoring meaning
- genre-specific personality tuning
