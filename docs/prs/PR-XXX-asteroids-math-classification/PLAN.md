Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# PR-XXX - Asteroids Math Classification

## Scope
- Inspect `games/asteroids/utils/math.js`.
- Classify each export as `ENGINE_CANDIDATE`, `GAME_ONLY`, or `SPLIT_REQUIRED`.
- Identify all current callers.
- Produce a surgical migration plan only (no runtime code changes in this PR).

## Export Classification

| Export | Classification | Reasoning |
| --- | --- | --- |
| `TAU` | `GAME_ONLY` | Used only once in Asteroids (`Asteroid` spawn angle). Engine code currently uses `Math.PI * 2` directly in multiple places, and centralizing this constant now would add churn with low reuse value. |
| `wrap(value, max)` | `SPLIT_REQUIRED` | Concept is reusable, but current API is Asteroids-shaped (`min` is implicitly `0`) and behavior is single-step wrap, not full modulo for large deltas. Engine extraction should define a stable generic contract first. |
| `distance(a, b)` | `ENGINE_CANDIDATE` | Pure Euclidean 2D helper with repeated gameplay use and similar duplication in engine modules. Can be promoted as a tiny shared helper with explicit Euclidean semantics. |
| `randomRange(min, max)` | `SPLIT_REQUIRED` | Generic helper, but current implementation is hard-wired to `Math.random()`. Engine-level utility should support RNG injection for deterministic tests/replay workflows, while game can keep a convenience wrapper. |

## Caller Inventory

### Module importers of `../utils/math.js`
- `games/asteroids/entities/Asteroid.js:7`
- `games/asteroids/entities/Bullet.js:7`
- `games/asteroids/entities/Ship.js:7`
- `games/asteroids/entities/Ufo.js:8`
- `games/asteroids/game/AsteroidsWorld.js:12`
- `games/asteroids/systems/ShipDebrisSystem.js:7`

### `TAU` callers
- `games/asteroids/entities/Asteroid.js:58` (`randomRange(0, TAU)`)

### `wrap` callers
- `games/asteroids/entities/Asteroid.js:67`
- `games/asteroids/entities/Asteroid.js:68`
- `games/asteroids/entities/Bullet.js:20`
- `games/asteroids/entities/Bullet.js:21`
- `games/asteroids/entities/Ship.js:58`
- `games/asteroids/entities/Ship.js:59`

### `distance` callers
- `games/asteroids/entities/Ufo.js:104`
- `games/asteroids/game/AsteroidsWorld.js:263`
- `games/asteroids/game/AsteroidsWorld.js:264`
- `games/asteroids/game/AsteroidsWorld.js:265`
- `games/asteroids/game/AsteroidsWorld.js:302`
- `games/asteroids/game/AsteroidsWorld.js:312` (appears twice in same expression)

### `randomRange` callers
- `games/asteroids/entities/Asteroid.js:56`
- `games/asteroids/entities/Asteroid.js:57`
- `games/asteroids/entities/Asteroid.js:58`
- `games/asteroids/entities/Asteroid.js:59`
- `games/asteroids/entities/Ufo.js:47`
- `games/asteroids/entities/Ufo.js:49`
- `games/asteroids/entities/Ufo.js:52`
- `games/asteroids/entities/Ufo.js:53`
- `games/asteroids/entities/Ufo.js:63`
- `games/asteroids/entities/Ufo.js:64`
- `games/asteroids/entities/Ufo.js:88`
- `games/asteroids/entities/Ufo.js:89`
- `games/asteroids/game/AsteroidsWorld.js:27`
- `games/asteroids/game/AsteroidsWorld.js:28`
- `games/asteroids/game/AsteroidsWorld.js:178`
- `games/asteroids/game/AsteroidsWorld.js:195`
- `games/asteroids/game/AsteroidsWorld.js:196`
- `games/asteroids/game/AsteroidsWorld.js:206`
- `games/asteroids/game/AsteroidsWorld.js:207`
- `games/asteroids/systems/ShipDebrisSystem.js:43`
- `games/asteroids/systems/ShipDebrisSystem.js:44`
- `games/asteroids/systems/ShipDebrisSystem.js:45`

## Surgical Migration Plan (Follow-up Implementation PR)
1. Add engine math APIs first, without behavior changes to Asteroids call sites.
2. Promote `distance` to `engine/utils/math.js` and export via `engine/utils/index.js`.
3. Introduce a generic wrap API in engine (for example, explicit bounds contract), then keep Asteroids-local adapter semantics until validated.
4. Introduce RNG-aware range helper in engine (for example, optional RNG function), then keep Asteroids convenience wrapper on top.
5. Keep `TAU` local unless a broader engine constants pass is approved.
6. Migrate imports one helper at a time, in smallest safe batches (`distance` first, then `wrap`, then `randomRange`), validating gameplay after each batch.
7. Do not alter gameplay tuning constants during migration; only import paths and helper boundaries should change.

## Risk Checks
- Preserve Asteroids feel (movement wrap, UFO behavior, spawn/safety checks) after each extraction step.
- Avoid accidental semantic replacement in engine modules that use non-Euclidean distance (for example, Manhattan checks).
- If deterministic replay is a target, gate random helper migration on RNG-injection support rather than direct `Math.random()` coupling.
