# RECONCILIATION_LAYER_SPEC

## Objective
Define a reusable, sample-safe reconciliation layer for Level 11 progression. This layer compares predicted client-side simulation state with authoritative updates and determines how corrections should be surfaced and applied.

## Design Principles
- Layered, not invasive
- Sample-safe first
- Public-boundary only
- Debug-friendly by design
- No direct engine-core rewrites

## Core Terms
### Predicted State
The locally simulated state advanced by the client/sample before authoritative confirmation arrives.

### Authoritative State
The state accepted as source-of-truth from an approved upstream authority.

### Divergence
The measurable difference between predicted state and authoritative state for one entity, one frame, or one logical update.

### Correction
The action chosen to reduce or resolve divergence.

## Responsibilities
The reconciliation layer should:
- accept predicted snapshots
- accept authoritative snapshots or events
- align comparable state units
- compute deltas
- choose a correction strategy
- expose correction metadata to debug surfaces

The reconciliation layer should not:
- own rendering
- directly own transport/networking
- mutate engine internals through private hooks
- become a hidden replacement for game scene logic

## Suggested Data Flow
1. Sample/game simulation advances predicted state.
2. Snapshot is recorded into a bounded history buffer.
3. Authoritative update arrives through an approved source boundary.
4. Reconciliation layer matches update to a frame/tick/entity.
5. Divergence is computed.
6. Correction policy decides snap, smooth correction, or debug-hold.
7. Debug contract receives normalized divergence/correction data.

## Candidate Interfaces
```text
recordPredictedSnapshot(snapshot)
receiveAuthoritativeSnapshot(snapshot)
reconcileLatest()
getLatestDivergenceReport()
getCorrectionPlan()
```

Exact naming may vary, but the functional responsibilities should remain stable.

## Correction Modes
### 1. Snap
Use when:
- divergence is severe
- object count is low
- clarity is more important than feel
- debug mode explicitly requests hard truth

### 2. Smooth Settle / Lerp
Use when:
- divergence is modest
- visual continuity matters
- the sample is teaching correction behavior

### 3. Hold + Annotate
Use when:
- goal is observability
- immediate correction would hide the problem
- the sample/debug overlay needs to show the mismatch clearly

## Normalized Divergence Fields
Recommended normalized fields for debug/reporting:
- `entityId`
- `predictedFrame`
- `authoritativeFrame`
- `positionDelta`
- `velocityDelta`
- `stateFlagsDelta`
- `correctionMode`
- `severity`

## Severity Guidance
Suggested severity bands:
- low: informational
- medium: visible mismatch, correction recommended
- high: state invalidation or obvious desync

## Boundary Rules
- No new engine-core dependency from shared engine code into sample code.
- No private scene mutation shortcuts.
- No transport assumptions baked into reconciliation interfaces.
- Shared logic should remain consumable by multiple future samples.

## Migration Guidance from Sample C
Sample C should remain:
- a teaching sample
- a divergence visualization surface
- an early consumer of the contract

Sample C should not become:
- the shared reconciliation implementation itself
- a dumping ground for generic runtime logic

## Future Expansion
This spec should later support:
- rollback/resimulation experiments
- server trace visualization
- deterministic replay comparison
- multi-entity correction batching
