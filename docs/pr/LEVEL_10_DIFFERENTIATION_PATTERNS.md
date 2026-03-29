Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_DIFFERENTIATION_PATTERNS.md

# Level 10 Differentiation Patterns

## Composition Patterns

### Difficulty Curve Pattern
Use:
- Events to trigger ramps
- World State to scope ramps by phase or wave
- local adapters to map ramps into game-specific values

Keep local:
- score multipliers
- pacing targets
- player-pressure rules

### Advanced Spawn Pattern
Use:
- Spawn as the stable cadence contract
- local factory/adapters for weighted pools, lane choice, or formation shaping
- Events to modify cadence or selection windows

Keep local:
- formation geometry
- lane definitions
- archetype weights

### Behavioral Differentiation Pattern
Use:
- Lifecycle for movement, expiry, and bounds ownership
- Events for mode switches
- World State for phase-gated behavior changes

Keep local:
- chase logic
- targeting policy
- enemy gimmicks

### Reward Window Pattern
Use:
- Events for bonus openings and timed reward windows
- World State for stage-completion gating

Keep local:
- scoring rules
- bonus meaning
- streak policies

## Extension Rules
Allowed:
- add local adapters around stable public APIs
- compose multiple systems in scene orchestration
- add config tables for advanced pacing and pattern control

Forbidden:
- forking core system implementations per game
- adding renderer or input logic to systems
- exposing private counters as public dependency
- mutating core contracts to fit one game
