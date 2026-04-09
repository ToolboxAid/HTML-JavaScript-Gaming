# BUILD_PR: REPO_CLEANUP_PHASE_1B_ENGINE_BOUNDARY_AND_DUPLICATE_HELPER_SCAN

## Execution Summary
- Docs-first scan completed across `src/engine/utils/**`, `src/engine/ui/**`, `games/**`, `tools/**`, and `samples/**`.
- This phase made no runtime/helper consolidation changes.
- Classification produced candidate groups for immediate low-risk cleanup and deferred manual review.

## Findings: Already in engine, local duplicate
| path | responsibility | duplicate of | should be in engine | already in engine | canonical location | risk | recommendation |
|---|---|---|---|---|---|---|---|
| `games/Asteroids/utils/math.js` | wraps random/wrap helpers for Asteroids | `src/engine/utils/math.js` (`randomRange`, `wrap`) | no (wrapper can stay local) | yes | `src/engine/utils/math.js` | low | Keep only game-specific surface (`TAU`) or import engine helpers directly in consumers in a follow-up micro-PR. |
| `games/*/game/*` local `function clamp(...)` cluster | scalar clamp utility repeated in multiple game modules | `src/engine/utils/math.js` (`clamp`) | no | yes | `src/engine/utils/math.js` | medium | Migrate in small batches (one game at a time) to reduce behavior/regression risk. |
| `tools/Vector Map Editor/editor/VectorMapFullscreenController.js` | fullscreen toggle + state sync | `src/engine/runtime/FullscreenService.js` | no | yes | `src/engine/runtime/FullscreenService.js` | low | Replace tool-local controller with engine runtime service adapter. |
| `tools/Vector Map Editor/editor/VectorMapSerializer.js` + `tools/Vector Map Editor/editor/VectorMapRuntimeExporter.js` | blob download orchestration | `src/engine/runtime/BrowserDownloadService.js` | no | yes | `src/engine/runtime/BrowserDownloadService.js` | low | Route downloads through `BrowserDownloadService` and keep only payload-building logic local. |
| `samples/_shared/platformerHelpers.js` (`overlap`) | AABB overlap predicate | `src/engine/collision/aabb.js` (`isColliding`) | no | yes | `src/engine/collision/index.js` | low | Import/alias `isColliding` in shared sample helper instead of redefining overlap math. |

## Findings: Should be promoted to engine
| path | responsibility | duplicate of | should be in engine | already in engine | canonical location | risk | recommendation |
|---|---|---|---|---|---|---|---|
| `games/SpaceInvaders/game/SpaceInvadersHighScoreService.js`, `games/SpaceDuel/game/SpaceDuelHighScoreService.js`, `games/Asteroids/systems/AsteroidsHighScoreService.js` | normalized table-based high score persistence | each other (near-identical sanitize/sort/load/save flow) | yes | partial (`StorageService` only) | `src/engine/persistence/` (new `HighScoreTableService`) | medium | Add an engine-level reusable table service with injectable defaults/key/tableSize; then thin each game service. |
| `games/Breakout/game/BreakoutInputController.js`, `games/Pong/game/PongInputController.js`, `games/SpaceInvaders/game/SpaceInvadersInputController.js`, plus similar axis/pad glue in other game controllers | repeated keyboard+gamepad axis merge and action button mapping | each other (pickAxis/readDigitalAxis patterns) | yes (internal helper) | partial (`GamepadInputAdapter`) | `src/engine/input/` (new internal mapping helper) | medium | Introduce a narrow internal helper for digital-axis and action-button mapping to cut duplicated controller glue. |

## Findings: Correctly local, keep out of engine
| path | responsibility | duplicate of | should be in engine | already in engine | canonical location | risk | recommendation |
|---|---|---|---|---|---|---|---|
| `games/SpaceDuel/game/WaveController.js` | Space Duel enemy/hazard wave simulation | name overlap only with Space Invaders | no | no | `games/SpaceDuel/game/` | low | Keep local; logic is game-specific and not generic engine behavior. |
| `games/SpaceInvaders/game/WaveController.js` | HUD/banner wave presentation helper | name overlap only with Space Duel | no | no | `games/SpaceInvaders/game/` | low | Keep local; consider rename for clarity (see manual review). |
| `samples/_shared/platformerHelpers.js` movement/ramp/platform helpers | similar to engine collision resolution, but teaching-oriented and sample-scoped | no | partial | `samples/_shared/` | low | Keep sample pedagogy helpers local; only dedupe pure primitives (`overlap`/`clamp`) where safe. |
| `games/Asteroids/game/AsteroidsAttractAdapter.js` + `games/SpaceDuel/game/SpaceDuelAttractAdapter.js` | attract-mode rendering and choreography | near-duplicate structure, different presentation semantics | no | no | per-game folders | medium | Keep local; shared engine abstraction not yet justified. |

## Findings: Duplicate but not ready to consolidate
| path | responsibility | duplicate of | should be in engine | already in engine | canonical location | risk | recommendation |
|---|---|---|---|---|---|---|---|
| `games/PacmanLite/game/PacmanLiteInputController.js` + `games/PacmanFullAI/game/PacmanFullAIInputController.js` | queued direction input parsing | each other (nearly identical) | no | no | per-game folders | low | Consolidate game-local shared controller first; decide engine promotion later if a third consumer appears. |
| `games/Bouncing-ball/game/BouncingBallInputController.js` + `games/PaddleIntercept/game/PaddleInterceptInputController.js` | start/pause/reset button mapping | each other | no | partial | per-game folders | low | Consolidate into shared mini-helper under `games/_shared/` (if that folder is approved) before engine consideration. |
| `tools/Vector Map Editor/editor/VectorMapSerializer.js` + `tools/Vector Map Editor/editor/VectorMapRuntimeExporter.js` | repeated DOM download ceremony | each other and `BrowserDownloadService` | no | yes | `tools/Vector Map Editor/editor/` for payload logic, `src/engine/runtime/` for download transport | low | Do tool-local dedupe and engine service adoption in one contained tool PR. |

## Findings: Manual review required
| path | responsibility | duplicate of | should be in engine | already in engine | canonical location | risk | recommendation |
|---|---|---|---|---|---|---|---|
| `games/SpaceInvaders/game/WaveController.js` naming | helper name implies simulation controller but currently HUD/banner presenter | `games/SpaceDuel/game/WaveController.js` (name only) | no | no | likely rename to `WaveHudPresenter`/`WaveStatusPresenter` | low | Rename in a doc-safe or tiny code-safe follow-up with import-site checks. |
| `tools/SpriteEditor_old_keep/main.js` local `clamp` | overlaps engine clamp but file is a large patch/stabilization entrypoint | `src/engine/utils/math.js` (`clamp`) | uncertain | yes | evaluate per SpriteEditor stability plan | medium | Defer until SpriteEditor stabilization work is complete; avoid mixing concerns. |
| `samples/sample003-mouse-input/MouseInputScene.js`, `samples/sample004-gamepad-input/GamepadScene.js` class-local clamp methods | duplicates engine clamp, but potentially intentional pedagogy | `src/engine/utils/math.js` (`clamp`) | uncertain | yes | sample-specific decision | low | Keep as-is unless sample docs explicitly prefer engine helper usage. |
| Target path expectation: `src/engine/math/**` | scan target includes path that does not exist in repo (math lives under `src/engine/utils/math.js`) | N/A | N/A | N/A | `src/engine/utils/math.js` | low | Update future scan templates/docs to avoid path drift. |

## Explicit File Lists

### Clamp duplicates in games (17 files)
- `games/AITargetDummy/game/AITargetDummyController.js`
- `games/AITargetDummy/game/AITargetDummyInputController.js`
- `games/AITargetDummy/game/AITargetDummyWorld.js`
- `games/Asteroids/game/AsteroidsAttractAdapter.js`
- `games/Bouncing-ball/game/BouncingBallWorld.js`
- `games/Breakout/game/BreakoutWorld.js`
- `games/Gravity/game/GravityInputController.js`
- `games/Gravity/game/GravityWorld.js`
- `games/MultiBallChaos/game/MultiBallChaosWorld.js`
- `games/PacmanLite/game/PacmanLitePlayerController.js`
- `games/PaddleIntercept/game/PaddleInterceptWorld.js`
- `games/Pong/game/PongWorld.js`
- `games/SpaceDuel/game/SpaceDuelAttractAdapter.js`
- `games/SpaceInvaders/game/SpaceInvadersInputController.js`
- `games/SpaceInvaders/game/SpaceInvadersWorld.js`
- `games/Thruster/game/ThrusterInputController.js`
- `games/Thruster/game/ThrusterWorld.js`

### High-score service cluster
- `games/Asteroids/systems/AsteroidsHighScoreService.js`
- `games/SpaceDuel/game/SpaceDuelHighScoreService.js`
- `games/SpaceInvaders/game/SpaceInvadersHighScoreService.js`
- Related single-value variant: `games/Asteroids/systems/HighScoreStore.js`

### Input-controller duplication cluster
- `games/Breakout/game/BreakoutInputController.js`
- `games/Pong/game/PongInputController.js`
- `games/SpaceInvaders/game/SpaceInvadersInputController.js`
- `games/Gravity/game/GravityInputController.js`
- `games/Thruster/game/ThrusterInputController.js`
- `games/AITargetDummy/game/AITargetDummyInputController.js`
- `games/Bouncing-ball/game/BouncingBallInputController.js`
- `games/PaddleIntercept/game/PaddleInterceptInputController.js`
- `games/PacmanLite/game/PacmanLiteInputController.js`
- `games/PacmanFullAI/game/PacmanFullAIInputController.js`

### VectorMapEditor overlap with engine runtime services
- `tools/Vector Map Editor/editor/VectorMapFullscreenController.js`
- `tools/Vector Map Editor/editor/VectorMapSerializer.js`
- `tools/Vector Map Editor/editor/VectorMapRuntimeExporter.js`

### Sample overlap helper duplicates
- `samples/_shared/platformerHelpers.js` (`overlap`, `clamp`)
- `samples/sample067-hitboxes-hurtboxes/HitboxesHurtboxesScene.js` (`overlap`)
- `samples/sample068-projectile-system/ProjectileSystemScene.js` (`overlap`)
- `samples/sample069-health-system/HealthSystemScene.js` (`overlap`)
- `samples/sample070-damage-knockback/DamageKnockbackScene.js` (`overlap`)
- `samples/sample071-invulnerability-frames/InvulnerabilityFramesScene.js` (`overlap`)
- `samples/sample072-simple-enemy-ai/SimpleEnemyAIScene.js` (`overlap`)

## Risk Notes
- Main regression risk is input-feel drift when replacing local clamp/axis logic in games.
- High-score service consolidation must preserve per-game defaults and key namespaces.
- Tool-side fullscreen/download migration risk is low if behavior remains adapter-compatible.
- Sample pedagogical clarity can be harmed by over-abstraction; prefer selective dedupe only.

## Recommended Follow-Up BUILD_PRs
1. `BUILD_PR: REPO_CLEANUP_PHASE_1C_LOW_RISK_ENGINE_HELPER_ADOPTION`
   - Adopt `FullscreenService` and `BrowserDownloadService` in `tools/Vector Map Editor`.
   - Replace obvious local `clamp` duplicates in one low-risk game slice.
2. `BUILD_PR: REPO_CLEANUP_PHASE_1D_INPUT_CONTROLLER_SHARED_HELPERS`
   - Add internal engine input helper(s) for digital-axis and button mapping.
   - Migrate a pilot set (`Breakout`, `Pong`, `SpaceInvaders`).
3. `BUILD_PR: REPO_CLEANUP_PHASE_1E_HIGH_SCORE_TABLE_ENGINE_SERVICE`
   - Add `src/engine/persistence` table-based high score service.
   - Migrate `Asteroids`, `SpaceDuel`, `SpaceInvaders` services to thin adapters.
4. `BUILD_PR: REPO_CLEANUP_PHASE_1F_NAMING_AND_TEMPLATE_ALIGNMENT`
   - Resolve `WaveController` naming ambiguity in Space Invaders.
   - Update cleanup template path expectation from `src/engine/math/**` to `src/engine/utils/math.js`.

## Phase Status
- Classification and planning complete.
- Consolidation intentionally deferred to follow-up BUILD_PRs.
