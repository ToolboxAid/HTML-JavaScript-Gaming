Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_6_WORLD_STATE_GAME_STATE_SPEC.md

# Level 10.6 - World State / Game State Spec

## Objective
Define a canonical shared state contract for advanced systems to coordinate progression safely without hidden coupling.

## Canonical Shared State Shape
`worldState`
- `session`: run/session metadata and status flags
- `progression`: wave/round/level and pacing metadata
- `outcomes`: win/loss/pause/completion summary state
- `scores`: score totals, reward points, and rank snapshots
- `objectives`: objective and mission aggregate snapshots
- `flags`: named boolean feature and scenario flags

`gameState`
- `mode`: named gameplay mode (`boot`, `menu`, `play`, `pause`, `summary`)
- `phase`: named active phase (`intro`, `wave_active`, `transition`, `boss`, `complete`)
- `subsystems`: safe state summaries by subsystem id
- `timers`: named timer snapshots for coordination reads
- `meta`: non-authoritative metadata for diagnostics

## State Invariants
- Shared state writes occur only through named transitions.
- Selectors expose read-only snapshots.
- State ownership is explicit per key domain.
- Cross-domain writes in a single transition are allowed only when documented as atomic.

## Versioning
- State contract version is explicit and incremented on breaking shape changes.
- Additive fields are allowed when selectors provide safe defaults.
- Deprecation windows are defined before removing fields.

## Persistence Guidance
- Persistence policy is explicit per domain key.
- Ephemeral runtime fields are excluded from persistence by default.
- Persisted fields must remain backward-compatible across contract versions.

## Non-Goals
- no replacement of engine lifecycle semantics
- no direct gameplay rule ownership in the shared state layer
- no bypass of existing system public APIs
