# DEBUG_SURFACE_CONTRACT

## Objective
Define a small, explicit contract for network/debug surfaces so future samples and tools do not invent incompatible overlay wiring.

## Principles
- Optional attachment
- Read-mostly behavior
- No hard dependency from core runtime onto debug surfaces
- Consistent terminology across samples

## Contract Shape
A debug surface should be attachable to a scene/model/reconciliation provider through a documented interface rather than through direct private mutation.

## Recommended Capability Areas
### 1. Attach / Detach
```text
attachDebugSurface(context)
detachDebugSurface()
```

### 2. State Reads
The debug surface may read:
- predicted summary
- authoritative summary
- divergence report
- correction plan
- timeline status

### 3. Render / Update Hooks
The debug surface may:
- render textual diagnostics
- render markers/paths/vectors
- highlight corrected entities
- show current correction mode and severity

The debug surface should not:
- own game logic
- directly change authoritative truth
- require engine-core changes to exist

## Recommended Context Shape
```text
{
  scene,
  getPredictedState,
  getAuthoritativeState,
  getLatestDivergenceReport,
  getCorrectionPlan,
  getTimelineStatus
}
```

Exact names may vary, but this shape should remain conceptually stable.

## Toggle Strategy
Allowed activation patterns:
- hardcoded sample-dev flag during early development
- URL/query flag later
- hub/dev menu toggle later

Disallowed pattern:
- unconditional permanent coupling that forces debug rendering in normal runtime paths

## Visual Guidance
Debug surfaces should prefer:
- clear text labels
- simple vector/marker overlays
- severity cues through shape/placement, not fragile assumptions

Avoid over-design or making the sample unreadable.

## Sample C Role
Sample C acts as the proving ground for this contract. It should be refactored toward the contract over time, not treated as the final shared solution.

## Future Extension Points
The same contract should later support:
- server dashboard mirrors
- transport latency indicators
- reconciliation counters
- history scrubbers
- replay comparison overlays
