# BUILD_PR_SHARED_EXTRACTION_28_CLAMP_CORE_BATCH

## Purpose
Centralize duplicated `clamp(value, min, max)` implementations across core/game usage into the engine math utility.

## Single PR Purpose
Normalize ONLY this helper:

- clamp(value, min, max)

Target batch (core + games using identical signature):

1. games/AITargetDummy/game/AITargetDummyController.js
2. games/AITargetDummy/game/AITargetDummyInputController.js
3. games/AITargetDummy/game/AITargetDummyWorld.js
4. games/Asteroids/game/AsteroidsAttractAdapter.js
5. games/Bouncing-ball/game/BouncingBallWorld.js
6. games/Breakout/game/BreakoutWorld.js
7. games/Gravity/game/GravityInputController.js
8. games/Gravity/game/GravityWorld.js
9. games/MultiBallChaos/game/MultiBallChaosWorld.js
10. games/network_sample_a/game/FakeLoopbackNetworkModel.js
11. games/network_sample_a/game/NetworkSampleAScene.js
12. games/network_sample_b/game/FakeHostClientNetworkModel.js
13. games/network_sample_c/game/FakeDivergenceTraceNetworkModel.js
14. games/PacmanLite/game/PacmanLitePlayerController.js
15. games/PaddleIntercept/game/PaddleInterceptWorld.js
16. games/Pong/game/PongWorld.js
17. games/SpaceDuel/game/SpaceDuelAttractAdapter.js
18. games/SpaceInvaders/game/SpaceInvadersInputController.js
19. games/SpaceInvaders/game/SpaceInvadersWorld.js
20. games/Thruster/game/ThrusterInputController.js
21. games/Thruster/game/ThrusterWorld.js

## Exact Files Allowed

### Canonical shared source
1. src/engine/utils/math.js

### Consumers
(only the 21 listed files)

## Shared Helper
Use:
- src/engine/utils/math.js

Fail fast unless it exports:
- clamp

If present but not exported correctly → minimal export fix only.

## Change Rules

### Shared file
Allowed:
- ensure clamp exists
- ensure clamp is exported

Not allowed:
- no behavior change

### Consumer files
If local:
```js
function clamp(value, min, max)
```

Then:
- remove local definition
- import clamp from src/engine/utils/math.js
- merge into existing import if present

Do NOT touch:
- clamp with fallback param
- clamp variants with different signatures

## Constraints
- no tools
- no debug
- no samples
- no behavior change
- exact batch only

## Validation
- only listed files changed
- no local clamp definitions remain in listed files
- imports added correctly
- no signature mismatch introduced

## Non-Goals
- no clamp(fallback) variants
- no tools clamp cleanup
