Toolbox Aid
David Quesenberry
03/25/2026

# BUILD_PR — AI Target Dummy Behavior Tuning

## Goal
Improve clarity, stability, and believability of AI behavior in AI Target Dummy by tuning state transitions, adding hysteresis/cooldowns, and enhancing debug visibility—without changing engine or introducing new systems.

## Scope
- tune state transitions (idle, patrol, pursue, evade)
- add hysteresis (separate enter/exit thresholds)
- add minimum state durations and cooldown timers
- smooth velocity/steering to reduce jitter
- centralize parameters in AITargetDummyConfig.js
- upgrade debug overlay for clear AI intent
- keep gameplay rules unchanged
- no engine changes

## Implementation Details

### State Machine Tuning
- Add hysteresis per state:
  - pursueEnterDist, pursueExitDist
  - evadeEnterDist, evadeExitDist
- Enforce minimum state duration:
  - minStateMs (per state or global)
- Add cooldowns to prevent rapid flipping:
  - stateCooldownMs
- Prioritize states deterministically (e.g., evade > pursue > patrol > idle)

### Movement / Steering
- Apply damping and max turn rate
- Optional acceleration limits
- Prevent instant direction flips (lerp/turn-rate clamp)

### Targeting
- Maintain lastKnownTarget position
- Add lostTargetTimeoutMs before dropping target
- Reacquire logic when back within acquire range

### Routing (Lightweight)
- Waypoint follow for patrol
- Simple obstacle avoidance if present
- No A* or heavy pathfinding

### Debug Overlay (Upgrade)
Display:
- current state (text)
- target position (marker)
- distance to target
- radii (enter/exit thresholds as circles)
- velocity vector
- last decision time

### Configuration (Centralized)
- /games/AITargetDummy/game/AITargetDummyConfig.js
  - pursueEnterDist / pursueExitDist
  - evadeEnterDist / evadeExitDist
  - speeds per state
  - damping / turn rate
  - minStateMs
  - stateCooldownMs
  - lostTargetTimeoutMs

## Files to Update
- /games/AITargetDummy/game/AITargetDummyStateMachine.js
- /games/AITargetDummy/game/AITargetDummyController.js
- /games/AITargetDummy/game/AITargetDummyNavigator.js (if needed)
- /games/AITargetDummy/game/AITargetDummyDebugOverlay.js
- /games/AITargetDummy/game/AITargetDummyConfig.js
- /tests/games/AITargetDummy*.test.mjs (add/update as needed)
- /tests/run-tests.mjs (register if needed)

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if used)

## Engine Boundary Rules
- keep AI logic in game layer
- do not generalize into engine yet
- only promote helpers if reused later
- keep scene thin

## Non-Goals
- no A* pathfinding
- no complex AI framework
- no engine modifications
- no unrelated refactor

## Acceptance Criteria
- states are clearly distinguishable (pursue, evade, patrol)
- no rapid state flipping (hysteresis + cooldown working)
- movement is smooth (no jitter)
- AI applies pressure over time without randomness
- debug overlay clearly communicates AI intent
- no console errors
- tests updated and passing

## Commit Comment
Tune AI Target Dummy behavior, state transitions, and debug visibility

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_AI_TARGET_DUMMY_TUNING
