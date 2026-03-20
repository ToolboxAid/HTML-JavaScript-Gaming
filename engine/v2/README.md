# Engine V2 Bootstrap

Engine V2 is a parallel rewrite track.

The current engine stays locked. New work goes into `engine/v2/` until the boundaries are proven with samples and tests.

## Rules

- one class = one concern
- no game-specific behavior in engine classes
- no rendering logic inside timing classes
- no timing logic inside scene classes
- no hidden globals
- samples prove usage
- tests prove behavior

## Initial layout

- `core/` = loop, surface, timing
- `scenes/` = scene contract and scene switching
- `utils/` = tiny shared helpers only

## Current bootstrap slice

This first pass only establishes:

- deterministic fixed-step updates
- render interpolation support
- scene lifecycle boundaries
- canvas ownership boundary
- sample wiring
- test harness

Games will be rebuilt after the engine boundary is stable.
