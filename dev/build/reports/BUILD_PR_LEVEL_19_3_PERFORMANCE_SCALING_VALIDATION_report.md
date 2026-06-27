# BUILD PR LEVEL 19.3 - Performance Scaling Validation Report

Generated: 2026-04-17T14:50:06.882Z
Node: v22.15.0

## Scenario Results
- asteroids_1000_entities_balanced
  - entityCount: 1000
  - simulatedSeconds: 15.00
  - avgFrameMs: 0.40 | p95FrameMs: 0.04 | maxFrameMs: 287.52
  - avgFPS: 2507.72 | p95FPS-equivalent: 27624.31
  - heapDeltaMB: 0.45 | rssDeltaMB: 3.96
  - heapSlopeKBps: 99.75
  - validation: stableFps=true, stableFrameP95=true, noLeak=true, passed=true
- asteroids_2000_entities_collision_heavy
  - entityCount: 2000
  - simulatedSeconds: 10.00
  - avgFrameMs: 1.89 | p95FrameMs: 2.30 | maxFrameMs: 924.94
  - avgFPS: 530.43 | p95FPS-equivalent: 434.91
  - heapDeltaMB: 0.43 | rssDeltaMB: 4.56
  - heapSlopeKBps: 49.63
  - validation: stableFps=true, stableFrameP95=true, noLeak=true, passed=true
- gravitywell_5000_beacon_scan
  - entityCount: 5004
  - simulatedSeconds: 15.00
  - avgFrameMs: 0.01 | p95FrameMs: 0.00 | maxFrameMs: 1.80
  - avgFPS: 92231.07 | p95FPS-equivalent: 5000000.00
  - heapDeltaMB: 1.02 | rssDeltaMB: 0.92
  - heapSlopeKBps: 67.39
  - validation: stableFps=true, stableFrameP95=true, noLeak=true, passed=true

## Bottlenecks
- Slowest average frame scenario: asteroids_2000_entities_collision_heavy (1.89 ms)
- Highest heap growth slope: asteroids_1000_entities_balanced (99.75 KB/s)
- Asteroids stress loads spend most frame time in nested bullet-asteroid and ship-asteroid polygon collision loops.
- GravityWell beacon-heavy loads scale linearly with beacon distance checks during collection evaluation.

## Stability Verdict
- passedAll: true
- All scenarios met FPS and memory stability thresholds for this validation slice.

