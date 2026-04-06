Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_4_EVENT_NAMING_AND_PAYLOAD_CONTRACTS.md

# Level 10.4 - Event Naming and Payload Contracts

## Naming Convention
Pattern:
- `<domain>.<entity>.<action>`

Examples:
- `spawn.entity.created`
- `lifecycle.entity.removed`
- `world.phase.changed`
- `events.trigger.activated`
- `objective.progress.updated`
- `mission.chain.completed`

## Name Stability Rules
- Event names are immutable after release
- Semantic drift requires a new event name
- Versioning is on payload contract, not name mutation

## Payload Contract Rules
- Payload fields use explicit, stable names
- No positional payload arrays for public contracts
- IDs must be stable strings
- Numeric fields declare unit semantics in docs (ms, seconds, ratio)
- Booleans represent state flags, not multi-state enums

## Required Contract Documentation per Event
- producer system
- allowed consumer systems
- payload schema
- version history
- deprecation and replacement path

## Contract Safety Rules
- Unknown fields are ignored by default
- Missing required fields cause contract rejection
- Type mismatch causes contract rejection
- Consumer logic must not mutate inbound payload objects

## Suggested Initial Public Event Inventory
- `spawn.entity.created`
  payload: `entityId`, `archetype`, `position`, `waveId`
- `spawn.wave.started`
  payload: `waveId`, `totalPlanned`, `seed`
- `lifecycle.entity.removed`
  payload: `entityId`, `reason`, `remainingCount`
- `world.phase.changed`
  payload: `previousPhase`, `nextPhase`, `transitionReason`
- `events.timer.elapsed`
  payload: `timerId`, `elapsedMs`, `scope`
- `objective.progress.updated`
  payload: `objectiveId`, `currentValue`, `targetValue`, `isComplete`
