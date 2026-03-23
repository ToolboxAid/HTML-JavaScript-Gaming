Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# PR-ASTEROIDS-HARDENING-AND-UTILITY-CLASSIFICATION

## Scope
- Inspect `games/Asteroids/` for gameplay hardening targets.
- Classify every current export in `games/Asteroids/utils/math.js`.
- Enumerate all callers of those exports.
- Produce planning/documentation only.

## Non-Goals For This PR
- No runtime behavior changes.
- No refactors in `games/Asteroids/*` or `engine/*`.
- No asset, balance, or tuning changes.

## Gameplay Hardening Targets

### P0 - State Safety And Determinism Boundary
1. **Validate and sanitize loaded world/session state before applying it**
- Evidence:
  - `games/Asteroids/game/AsteroidsWorld.js:146` (`loadState(state)`)
  - `games/Asteroids/game/AsteroidsWorld.js:162` (`Object.assign(this.ship, state.ship ?? {})`)
  - `games/Asteroids/game/AsteroidsWorld.js:48` (`createAsteroidFromState`)
  - `games/Asteroids/game/AsteroidsWorld.js:65` (`createUfoFromState`)
  - `games/Asteroids/game/AsteroidsSession.js:26` (`start(playerCount)`)
  - `games/Asteroids/game/AsteroidsSession.js:42` (`this.players[0].worldState = ...`)
- Hardening intent:
  - Guard against malformed state payloads, missing arrays/objects, NaN/Infinity values, and invalid player counts.
  - Prevent crashes from `players[0]` assumptions and invalid entity reconstruction.

2. **Isolate random source for replay/test consistency**
- Evidence:
  - `games/Asteroids/game/AsteroidsWorld.js:30` (`Math.random()` for starfield size)
  - `games/Asteroids/entities/Ufo.js:46` (`Math.random()` for direction)
- Hardening intent:
  - Route random decisions through an injectable RNG boundary (engine-side or session-level), keeping gameplay reproducible for deterministic harnesses.

3. **Strengthen wrap behavior for extreme frame deltas**
- Evidence:
  - `games/Asteroids/utils/math.js:11` (`wrap(value, max)` adapter)
  - `games/Asteroids/entities/Ship.js:58-59`, `Bullet.js:20-21`, `Asteroid.js:67-68`
- Hardening intent:
  - Ensure position wrapping remains valid under large `dtSeconds` spikes and extreme velocities (no off-screen drift from multi-span jumps).

### P1 - Logic Robustness And Dead Paths
1. **Resolve dead/unused spawn pathway**
- Evidence:
  - `games/Asteroids/game/AsteroidsWorld.js:285` (`maybeSpawnUfo`)
  - `games/Asteroids/game/AsteroidsWorld.js:290` (`this.ufoSpawnTimer -= 0`)
- Hardening intent:
  - Remove or rewire dead logic to avoid future divergence between intended and actual UFO spawn flow.

2. **Avoid strict float equality gates in fire control**
- Evidence:
  - `games/Asteroids/game/AsteroidsWorld.js:397` (`this.fireCooldown === 0`)
- Hardening intent:
  - Use tolerance-safe comparisons (`<= 0`) so input cadence is stable under floating-point drift.

3. **Sanitize persisted high-score values**
- Evidence:
  - `games/Asteroids/systems/HighScoreStore.js:19` (`Number(... ) || 0`)
- Hardening intent:
  - Clamp to finite non-negative integers and ignore invalid persisted payloads.

### P2 - Fairness And Recovery
1. **Harden player-swap wait behavior**
- Evidence:
  - `games/Asteroids/game/AsteroidsSession.js:173-188` (pending swap timer + UFO clear dependency)
- Hardening intent:
  - Add explicit fallback rules so swap does not risk long stalls if saucer state is abnormal.

2. **Harden wave spawn fallback fairness**
- Evidence:
  - `games/Asteroids/game/AsteroidsWorld.js:191-215` (`createWave` fallback spawn path)
- Hardening intent:
  - Ensure fallback asteroid placement cannot violate safe-start intent in edge cases.

## Utility Export Classification (`games/Asteroids/utils/math.js`)

| Export | Classification | Rationale |
| --- | --- | --- |
| `TAU` | `GAME_ONLY` | Asteroids-only convenience constant currently used for asteroid angle initialization; low cross-game value at current scale. |
| `wrap(value, max)` | `SPLIT_REQUIRED` | Current export is a game-shaped adapter (`0..max`) over engine utility; keep adapter for compatibility while hardening/migrating callers to explicit engine contracts where appropriate. |
| `randomRange(min, max)` | `SPLIT_REQUIRED` | Current export is a game convenience wrapper over engine RNG utility; deterministic workflows require explicit RNG injection boundaries, so split responsibilities should remain deliberate. |

## Callers Of `games/Asteroids/utils/math.js` Exports

### Importers
- `games/Asteroids/entities/Asteroid.js:7`
- `games/Asteroids/entities/Bullet.js:7`
- `games/Asteroids/entities/Ship.js:7`
- `games/Asteroids/entities/Ufo.js:9`
- `games/Asteroids/game/AsteroidsWorld.js:13`
- `games/Asteroids/systems/ShipDebrisSystem.js:7`

### `TAU` callers
- `games/Asteroids/entities/Asteroid.js:58`

### `wrap` callers
- `games/Asteroids/entities/Asteroid.js:67`
- `games/Asteroids/entities/Asteroid.js:68`
- `games/Asteroids/entities/Bullet.js:20`
- `games/Asteroids/entities/Bullet.js:21`
- `games/Asteroids/entities/Ship.js:58`
- `games/Asteroids/entities/Ship.js:59`

### `randomRange` callers
- `games/Asteroids/entities/Asteroid.js:56`
- `games/Asteroids/entities/Asteroid.js:57`
- `games/Asteroids/entities/Asteroid.js:58`
- `games/Asteroids/entities/Asteroid.js:59`
- `games/Asteroids/entities/Ufo.js:48`
- `games/Asteroids/entities/Ufo.js:50`
- `games/Asteroids/entities/Ufo.js:53`
- `games/Asteroids/entities/Ufo.js:54`
- `games/Asteroids/entities/Ufo.js:64`
- `games/Asteroids/entities/Ufo.js:65`
- `games/Asteroids/entities/Ufo.js:89`
- `games/Asteroids/entities/Ufo.js:90`
- `games/Asteroids/game/AsteroidsWorld.js:28`
- `games/Asteroids/game/AsteroidsWorld.js:29`
- `games/Asteroids/game/AsteroidsWorld.js:179`
- `games/Asteroids/game/AsteroidsWorld.js:196`
- `games/Asteroids/game/AsteroidsWorld.js:197`
- `games/Asteroids/game/AsteroidsWorld.js:207`
- `games/Asteroids/game/AsteroidsWorld.js:208`
- `games/Asteroids/systems/ShipDebrisSystem.js:43`
- `games/Asteroids/systems/ShipDebrisSystem.js:44`
- `games/Asteroids/systems/ShipDebrisSystem.js:45`

## Execution Sequence For Follow-Up Implementation PRs
1. Add state schema guards and numeric sanitizers (`AsteroidsSession` and `AsteroidsWorld` load/start paths).
2. Introduce deterministic RNG handoff and remove direct `Math.random()` usage in gameplay state transitions.
3. Harden wrap and fire-cooldown edge behavior without altering feel/tuning.
4. Remove dead spawn path ambiguity (`maybeSpawnUfo`) and document single source of spawn truth.
5. Add focused gameplay regression tests for pause, respawn safety, swap flow, wave spawn fairness, and serialization round-trip.

## Acceptance Criteria
- Invalid or partial save-state payloads do not crash runtime.
- One/two-player start paths remain stable with guarded input values.
- Random-dependent gameplay can be reproduced under injected RNG.
- Wrapping and shooting remain stable under large `dtSeconds`.
- Caller inventory and utility classifications remain accurate with no runtime file changes in this planning PR.
