# PLAN_PR - Engine Stabilization And Promotion Phase

## Goal
Define the next post-cleanup phase as a controlled stabilization and promotion pass: harden the engine where cleanup exposed remaining seams, identify only the local logic that is actually promotion-worthy, and use `games/Asteroids/` as the first serious validation target before broader extraction.

## Audit Summary
- Most late samples are already thin consumers of engine-owned systems rather than sources of new reusable logic.
- The highest-value remaining engine work is stabilization, not broad abstraction:
  - `engine/core/Engine.js:73-78` still changes scenes without calling `exit()`
  - `engine/scenes/TransitionScene.js:30-53` still reaches through `renderer.ctx`
  - `engine/persistence/StorageService.js:7-18` still defaults straight to `globalThis.localStorage`
  - `engine/fx/ParticleSystem.js:30-58` still uses direct `Math.random()` instead of an injectable RNG seam
- Asteroids is now the strongest real-world proof target because it exercises:
  - collision and polygon overlap flow
  - persistence-like snapshot restore
  - fullscreen/browser boot behavior
  - particle/audio coordination
  - multi-player turn swap and pause/menu/game-over transitions
- `samples/sample183-asteroids-game/` currently has no files, so the sample ladder does not yet end in a sample-backed bridge to the real Asteroids game.

## Scope
- `engine/`
- later samples, with emphasis on `sample90+`
- `games/Asteroids/`
- relevant tests
- docs-only planning output in this PR

## Out Of Scope
- runtime changes in this PR
- broad engine refactors without game-backed proof
- rewriting historical samples for consistency alone
- promoting one-off game-feel or UI policy into engine

## Stabilization Inventory

| Rank | Target | Evidence | Why it matters now | Risk | Promotion impact |
| --- | --- | --- | --- | --- | --- |
| P0 | Scene lifecycle parity between `Engine` and `SceneManager` | `engine/core/Engine.js:73-78`, `engine/scenes/SceneManager.js:15-24`, `engine/scenes/Scene.js:8-14` | `Engine` still calls `enter()` on the next scene without calling `exit()` on the previous one, while the dedicated scene manager already has that contract. That is the clearest remaining lifecycle inconsistency after Step 2A/2B. | High | Blocks trusting scene-backed promotion work and sample consolidation. |
| P1 | Transition renderer seam cleanup | `engine/scenes/TransitionScene.js:30-53`, `samples/sample129-scene-transitions/TransitionProofScene.js:22-28` | Transition rendering still depends on raw canvas context access instead of a renderer-owned alpha/compositing seam. | High | Needed before transition logic is treated as a stable engine contract. |
| P2 | Browser-backed persistence defaults | `engine/persistence/StorageService.js:7-18`, `engine/release/SettingsSystem.js:29-42`, `engine/core/Engine.js:56-63` | Persistence and settings still assume browser storage exists unless callers inject it. Cleanup already reduced other browser defaults, so this is the next obvious stabilizing pass. | Medium | A safer storage seam makes later promotions from Asteroids persistence work less brittle. |
| P3 | Deterministic engine-owned FX | `engine/fx/ParticleSystem.js:30-58`, `games/Asteroids/game/AsteroidsWorld.js:107-113`, `games/Asteroids/systems/ShipDebrisSystem.js:29-33` | Asteroids already injects RNG into its world and debris system, but the shared particle system still hardcodes randomness. That weakens deterministic testing and replay confidence. | Medium | Important before extracting any more effect presets or replay-sensitive logic. |
| P4 | Sample-to-game bridge at the end of the sample ladder | `samples/sample183-asteroids-game/` currently has no files; real playable game is `games/Asteroids/` | The sample series advertises a late Asteroids sample but there is no bridge artifact yet. That makes promotion proof weaker than the docs imply. | Medium | Useful for sample consolidation and for proving which Asteroids seams should stay local. |

## Later Sample Audit

### What the later samples already prove
- `sample90`, `sample95`, `sample96`, `sample121`, `sample126`, `sample129`, `sample141`, `sample142`, `sample150` are all primarily showing engine-owned systems rather than hiding reusable logic locally:
  - debug overlays already live under `engine/debug/index.js:7-13`
  - fullscreen state is scene-consumed, not scene-owned, in `samples/sample121-fullscreen-ability/FullscreenAbilityScene.js:51-58,73-84`
  - particle lifecycle is engine-owned in `samples/sample126-particle-fx/ParticleFxScene.js:17-24,28-42`
  - settings and accessibility already wrap engine release systems in `samples/sample141-settings-system/SettingsSystemScene.js:21-54` and `engine/release/AccessibilityOptions.js:16-74`
  - serializer / networking examples are already consuming engine-owned services in `samples/sample150-serialization-system/SerializationSystemScene.js:17-29`

### What still repeats locally
- Sample boot files still repeat the same browser bootstrap pattern:
  - `samples/sample91-event-bus/main.js:12-27`
  - `samples/sample96-performance-metrics/main.js:11-16`
  - `samples/sample121-fullscreen-ability/main.js:11-45`
  - `samples/sample141-settings-system/main.js:12-36`
  - `games/Asteroids/main.js:12-47`
- That repetition is real, but it is not an engine promotion target. If consolidated, it belongs under `samples/_shared` or a sample bootstrap helper, not in core engine runtime.

## Promotion Candidate Map

### Promotion note
The repo is already past the point where broad sample logic should be pulled into engine speculatively. The useful candidates are small and should only move after the stabilization PRs above land.

| Candidate | Current location(s) | Classification | Why |
| --- | --- | --- | --- |
| Vector point transform / rotation helpers used by Asteroids wireframe shapes | `games/Asteroids/entities/Ship.js:18-22,63-70`, `games/Asteroids/systems/ShipDebrisSystem.js:17-21,75-89`, existing engine anchor `engine/vector/VectorDrawing.js:7-20` | `PROMOTE_TO_ENGINE` | This logic is already conceptually engine-owned. Asteroids still carries bespoke trig helpers even though `engine/vector` has a generalized point transform. The follow-up should be a small adoption pass, not a new abstraction. |
| Persistence-backed single-value storage wrappers | `games/Asteroids/systems/HighScoreStore.js:17-34`, `samples/sample29-save-load-state/SaveLoadStateScene.js:55-76`, `engine/release/CrashRecoveryManager.js:42-69` | `SPLIT_REQUIRED` | There is a reusable core around "load one key, validate/coerce, save one key," but score semantics, crash payloads, and scene-owned state remain domain-specific. Promote only the generic keyed-value wrapper, keep policy local. |
| Snapshot/state sanitization for load/restore flows | `games/Asteroids/game/AsteroidsWorld.js:33-84,198-275,340-365`, `games/Asteroids/game/AsteroidsSession.js:7-37`, adjacent engine serializers `engine/persistence/WorldSerializer.js:7-12` | `SPLIT_REQUIRED` | Scalar coercion helpers are reusable, but the shape of Asteroids world/session state is absolutely game-specific. Promote narrow validation helpers only after engine persistence seams are stabilized. |
| Explosion/debris effect presets layered on top of engine FX | `samples/sample126-particle-fx/ParticleFxScene.js:26-42`, `games/Asteroids/game/AsteroidsGameScene.js:172-183`, `games/Asteroids/systems/ShipDebrisSystem.js:35-53` | `NEEDS_MORE_PROOF` | The reusable effect engine already exists. What is not yet proven is a general preset catalog or line-debris effect API that more than one game really needs. |
| Fullscreen UX affordance helpers and canvas click routing | `samples/sample121-fullscreen-ability/main.js:27-45`, `samples/sample121-fullscreen-ability/FullscreenAbilityScene.js:39-62`, `games/Asteroids/main.js:37-44` | `NEEDS_MORE_PROOF` | There is overlap, but it is still UI-policy heavy. We need at least one more real game or tool surface before promoting a browser interaction helper into engine/runtime. |
| Sample/browser bootstrap scaffolding | `samples/sample91-event-bus/main.js:12-27`, `samples/sample96-performance-metrics/main.js:11-16`, `samples/sample121-fullscreen-ability/main.js:11-45`, `samples/sample141-settings-system/main.js:12-36`, `games/Asteroids/main.js:12-47` | `KEEP_LOCAL` | This is repetition, but it belongs to sample infrastructure rather than engine runtime. If we consolidate it, do that under `samples/_shared`, not `engine/`. |
| Asteroids HUD, pause overlay, beat cadence, and menu/game-over presentation logic | `games/Asteroids/game/AsteroidsGameScene.js:17-71,186-199,280-327` | `KEEP_LOCAL` | This is game-feel and presentation policy, not engine-grade reusable logic. |
| Asteroids turn-swap / intro / score state orchestration | `games/Asteroids/game/AsteroidsSession.js:39-63,102-131,156-249` | `KEEP_LOCAL` | The two-player swap rules and intro flashing are specific to Asteroids turn structure, not a proven engine service. |

## Asteroids Validation Map

| Validation target | Current proof | Missing proof / risk | Why it matters to the phase |
| --- | --- | --- | --- |
| Scene lifecycle, pause/menu/game-over transitions | `games/Asteroids/game/AsteroidsGameScene.js:92-159,280-327`; current engine scene handoff in `engine/core/Engine.js:73-78` | No engine-level proof yet that scene replacement and lifecycle callbacks behave consistently with a real game flow | Best proving ground for the next engine lifecycle PR |
| World snapshot round-trip and player swap safety | `games/Asteroids/game/AsteroidsWorld.js:277-365`, `games/Asteroids/game/AsteroidsSession.js:162-249`, `tests/games/AsteroidsHardening.test.mjs:64-67,149-156` | Current tests prove a base round-trip and swap timeout path, but not full session persistence scenarios or boot/load integration | Strong candidate for stabilization before promoting persistence helpers |
| Collision, wave progression, respawn safety, and UFO gate behavior | `games/Asteroids/game/AsteroidsWorld.js:524-807`, `tests/games/AsteroidsHardening.test.mjs:69-139` | Core hardening exists, but large end-to-end combat/collision regression coverage is still thin | Primary gameplay stress test for engine collision and timing contracts |
| Audio and FX determinism | `games/Asteroids/systems/AsteroidsAudio.js:20-89`, `games/Asteroids/game/AsteroidsGameScene.js:172-199`, `engine/fx/ParticleSystem.js:30-58` | No deterministic tests for engine particles or Asteroids audio loop transitions | Important before extracting more FX helpers or replay-sensitive runtime paths |
| Browser boot readiness: fonts, fullscreen affordance, and click-to-enter behavior | `games/Asteroids/main.js:17-47` | No focused automated validation around font readiness, fullscreen availability, or browser boot contract | This is where real browser/runtime risk still lives |
| Sample handoff from late sample ladder to real game | `samples/sample183-asteroids-game/` currently has no files | No sample-level bridge proving how the late-sample series hands off to `games/Asteroids/` | Useful for tightening docs, demos, and promotion confidence |

## Recommended Small-PR Ladder

### BUILD_PR 1
`PR-ENGINE-STABILIZATION-PHASE1-SCENE-LIFECYCLE-AND-TRANSITION-SEAMS`

Scope:
- Make `Engine.setScene()` lifecycle behavior consistent with `SceneManager`
- Remove raw `renderer.ctx` dependence from `TransitionScene`
- Add focused engine/scene tests for `exit()` and transition rendering seams

Why first:
- This is the highest-risk remaining runtime inconsistency and blocks trusting scene-backed validation.

### BUILD_PR 2
`PR-ENGINE-STABILIZATION-PHASE2-PERSISTENCE-DEFAULTS-AND-FX-DETERMINISM`

Scope:
- Harden `StorageService` / `SettingsSystem` browser-default behavior
- Add RNG injection or equivalent seam to `ParticleSystem`
- Expand tests around storage absence and deterministic FX behavior

Why second:
- These are the next biggest sources of instability for Asteroids-backed validation and later promotion work.

### BUILD_PR 3
`PR-ASTEROIDS-VALIDATION-PHASE1-BOOT-LIFECYCLE-PERSISTENCE`

Scope:
- Add focused validation for Asteroids browser boot, fullscreen affordance, scene lifecycle, and snapshot/player-swap flows
- Do not extract anything yet; prove the game against the stabilized engine first

Why third:
- Promotion should follow proof, not precede it.

### BUILD_PR 4
`PR-ASTEROIDS-PROMOTION-PHASE1-VECTOR-TRANSFORMS-AND-STATE-GUARD-SPLITS`

Scope:
- Replace Asteroids-local point transform helpers with `engine/vector` usage
- Extract only the narrow reusable scalar/state coercion helpers if Asteroids validation confirms value
- Keep Asteroids schema, HUD, and session rules local

Why fourth:
- This is the first promotion pass that is both small and already supported by the current evidence.

### BUILD_PR 5
`PR-SAMPLE-CONSOLIDATION-PHASE1-LATE-SAMPLE-BOOTSTRAP-AND-SAMPLE183`

Scope:
- Consolidate repeated late-sample browser bootstraps under sample infrastructure if still valuable
- Either wire `sample183-asteroids-game` to a real bridge artifact or remove the misleading empty endpoint

Why last:
- This is cleanup and presentation debt, not runtime stabilization debt.

## No-Behavior-Change Statement
This PR is planning only. It does not change engine runtime, later samples, or `games/Asteroids/`. It records the post-cleanup stabilization targets, the cautious promotion candidate map, the Asteroids validation surfaces, and the recommended small-PR order.
