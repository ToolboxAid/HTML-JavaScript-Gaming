# STATE_TIMELINE_SPEC

## Objective
Define the history/timeline model needed to support Level 11 reconciliation work without altering engine-core timing systems.

## Why a Timeline Exists
A reconciliation layer needs more than “latest state.” It needs a bounded memory of recent predicted frames so authoritative updates can be aligned to the correct historical point.

## Timeline Responsibilities
- store recent predicted snapshots
- associate snapshots with frame/tick identifiers
- support lookup by frame/tick/entity
- expose enough history for debug and future replay concepts
- remain bounded and disposable

## Non-Goals
- replacing the engine game loop
- implementing full rollback netcode in this track
- persisting long-term session history

## Recommended Model
### Snapshot Record
Each record should minimally include:
- frame or tick id
- timestamp if available through approved boundary
- entity snapshot payload
- optional input marker / local action marker

### Bounded Buffer
Use a bounded history window sized for sample-scale debugging and reconciliation.

Suggested starting guidance:
- keep the newest N frames only
- prune oldest entries predictably
- avoid unbounded arrays/maps

Exact N can be implementation-defined, but should be documented in code comments and debug UI if visible.

## Lookup Scenarios
The timeline should support:
1. latest predicted snapshot for an entity
2. predicted snapshot matching authoritative frame/tick
3. nearest prior predicted snapshot when exact match is absent
4. compact debug summary for recent divergence events

## Alignment Strategy
### Preferred
Match authoritative update to exact frame/tick id.

### Acceptable fallback
Match to nearest earlier predicted frame and mark alignment as approximate.

### Avoid
Silently comparing unrelated frames with no annotation.

## Timeline Contract Concepts
```text
pushSnapshot(frameId, snapshot)
getSnapshot(frameId)
getNearestSnapshot(frameId)
getLatestSnapshot()
pruneOldSnapshots()
```

## Debug/Observability Hooks
Timeline data should make it possible to show:
- current predicted frame
- last authoritative frame received
- frame gap
- number of unresolved divergence entries
- whether alignment was exact or approximate

## Risks Controlled by This Spec
- comparing incompatible frames
- hiding staleness in authoritative data
- memory growth from unlimited history
- mixing scene runtime state directly with archived history objects

## Future Compatibility
This model should remain compatible with later:
- authoritative replay experiments
- server-trace comparison tools
- lag simulation demos
- deterministic verification samples
