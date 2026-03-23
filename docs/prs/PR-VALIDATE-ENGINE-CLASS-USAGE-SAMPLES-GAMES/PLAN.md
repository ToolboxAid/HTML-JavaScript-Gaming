Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# PLAN_PR - Validate Engine Class Usage Across Samples and Games

## Outcome
This PR is a docs-only audit.

No runtime source files are changed here.

## Audit Scope
- `engine/` as the canonical reference surface
- `samples/` shipped sample folders plus `samples/_shared/`
- `games/Asteroids/`
- `*.js`, `*.mjs`, and `*.html` files that import engine modules

## Classification Rules
- `CURRENT`: the shipped item uses only canonical engine entry points
- `STALE_USAGE`: the shipped item only uses deep engine file imports where a public engine barrel already exists
- `MIXED_USAGE`: the shipped item uses canonical entry points and also bypasses them with deep engine file imports
- `REVIEW_REQUIRED`: the shipped item uses an ambiguous path where no stable canonical replacement is provable from the current repo

## Canonical Engine Surface For Samples And Games

### Canonical rule
When `engine/<subsystem>/index.js` exists, samples and games should prefer that barrel as the public engine surface.

The one clear in-scope exception is `engine/core/Engine.js`, which remains the canonical boot/runtime import because `engine/core/` does not expose an `index.js` barrel.

### Proven canonical paths in current repo
| Canonical path | Role | Evidence |
| --- | --- | --- |
| `engine/core/Engine.js` | Canonical engine boot/runtime composition import | `engine/core/` contains `Engine.js`, `FixedTicker.js`, `FrameClock.js`, `RuntimeMetrics.js` and no `index.js` |
| `engine/scenes/index.js` | Canonical scene/lifecycle surface, including `Scene` | `engine/scenes/index.js:7` exports `Scene` |
| `engine/fx/index.js` | Canonical FX surface, including `ParticleSystem` | `engine/fx/index.js:7` exports `ParticleSystem` |
| `engine/collision/index.js` | Canonical AABB/polygon/raster collision surface | `engine/collision/index.js:7-10` exports the public helpers |
| `engine/utils/index.js` | Canonical math/util surface, including `distance`, `wrap`, `randomRange` | `engine/utils/index.js:8` exports `distance`, `wrap`, `randomRange` |
| `engine/tooling/index.js` | Canonical tooling surface, including `bootCapturePreview` | `engine/tooling/index.js:13` exports `bootCapturePreview` |
| `engine/persistence/index.js` | Canonical persistence surface, including `StorageService` | `engine/persistence/index.js:7` exports `StorageService` |
| `engine/input/index.js` | Canonical input surface | used broadly by samples and Asteroids boot |
| `engine/theme/index.js` | Canonical theme surface | used broadly by samples and Asteroids boot |
| `engine/vector/index.js` | Canonical reusable vector drawing/transform surface | used by Asteroids entities |
| Other `engine/*/index.js` barrels present in repo | Canonical public subsystem surfaces when consumed by samples/games | `rg --files engine -g "index.js"` shows barrels across `audio`, `world`, `render`, `runtime`, `release`, `security`, `automation`, `editor`, `network`, `memory`, `ai`, `camera`, `tilemap`, `ui`, `game`, `debug`, `assets`, and more |

## Key Findings

### 1. Samples are almost entirely aligned on public barrels except for `Scene`
The dominant repo-wide drift is not old engine class names. It is one specific deep import:

- `engine/scenes/Scene.js`

Representative evidence:
- `samples/sample05-scene-switch/main.js:11` already uses `SceneTransition` and `TransitionScene` from `engine/scenes/index.js`
- `samples/sample129-scene-transitions/main.js:10` already uses `SceneTransitionController` from `engine/scenes/index.js`
- `samples/sample05-scene-switch/IntroScene.js:7` still deep-imports `Scene` from `engine/scenes/Scene.js`
- `samples/sample160-tile-map-editor/TileMapEditorScene.js:7` still deep-imports `Scene` while using barrel imports for `debug`, `theme`, and `editor`

That means the samples are not using stale historical engine classes; they are using the current engine with a mixed scene entry pattern.

### 2. `samples/_shared/lateSampleBootstrap.js` is already current
`samples/_shared/lateSampleBootstrap.js` uses:
- `engine/core/Engine.js`
- `engine/theme/index.js`

Evidence:
- `samples/_shared/lateSampleBootstrap.js:7`
- `samples/_shared/lateSampleBootstrap.js:8`

This is the current pattern and should be treated as the alignment target for late-sample boot.

### 3. `games/Asteroids/` is mixed, not broadly stale
Asteroids already uses the current public engine surface in several places:
- `games/Asteroids/main.js:7-9` uses `Engine`, `engine/input/index.js`, and `engine/theme/index.js`
- `games/Asteroids/entities/Ship.js:8`, `games/Asteroids/entities/Asteroid.js:8`, and `games/Asteroids/entities/Ufo.js:9` use `engine/vector/index.js`
- `games/Asteroids/systems/HighScoreStore.js:7` uses `engine/persistence/index.js`
- `games/Asteroids/systems/AsteroidsAudio.js:7` uses `engine/audio/index.js`

Asteroids also still bypasses public barrels in a few narrow places:
- `games/Asteroids/game/AsteroidsGameScene.js:7` deep-imports `engine/scenes/Scene.js`
- `games/Asteroids/game/AsteroidsGameScene.js:14` deep-imports `engine/fx/ParticleSystem.js`
- `games/Asteroids/game/AsteroidsWorld.js:11` deep-imports `engine/collision/polygon.js`
- `games/Asteroids/game/AsteroidsWorld.js:12` and `games/Asteroids/entities/Ufo.js:8` deep-import `engine/utils/math.js`
- `games/Asteroids/utils/math.js:7` deep-imports `engine/utils/math.js`
- `games/Asteroids/capture-preview.html:28` deep-imports `engine/tooling/CapturePreviewRuntime.js`

Because each of those APIs is exported from a current barrel, this is `MIXED_USAGE`, not `REVIEW_REQUIRED`.

### 4. No proven `REVIEW_REQUIRED` class drift remained after the scan
The audit did not find a shipped sample/game import that lacked a provable canonical replacement.

It also did not find evidence of old class-name fossils such as a superseded engine bootstrap class or an obsolete renderer facade still being consumed by samples/games.

The drift is concentrated and mechanical:
- public barrel exists
- caller still deep-imports one file

## Exact Boundary Violations To Align

### Repo-wide sample violation
- `engine/scenes/Scene.js` is still imported directly across sample scene files even though `engine/scenes/index.js` exports `Scene`

### Asteroids-specific violations
- `engine/scenes/Scene.js` instead of `engine/scenes/index.js`
- `engine/fx/ParticleSystem.js` instead of `engine/fx/index.js`
- `engine/collision/polygon.js` instead of `engine/collision/index.js`
- `engine/utils/math.js` instead of `engine/utils/index.js`
- `engine/tooling/CapturePreviewRuntime.js` instead of `engine/tooling/index.js`

## Item Classification

### CURRENT
```text
_shared = CURRENT
```

### STALE_USAGE
```text
none
```

### REVIEW_REQUIRED
```text
none
```

### MIXED_USAGE
```text
sample01-basic-loop = MIXED_USAGE
sample02-keyboard-move = MIXED_USAGE
sample03-mouse-input = MIXED_USAGE
sample04-gamepad-input = MIXED_USAGE
sample05-scene-switch = MIXED_USAGE
sample06-input-mapping = MIXED_USAGE
sample07-entity-movement = MIXED_USAGE
sample08-render-adapter = MIXED_USAGE
sample09-collision = MIXED_USAGE
sample10-collision-response = MIXED_USAGE
sample11-multiple-solids = MIXED_USAGE
sample12-axis-separated-collision = MIXED_USAGE
sample13-tile-collision = MIXED_USAGE
sample14-collision-debug-tools = MIXED_USAGE
sample15-ecs-foundation = MIXED_USAGE
sample16-ecs-movement-system = MIXED_USAGE
sample17-ecs-input-system = MIXED_USAGE
sample18-ecs-collision-system = MIXED_USAGE
sample19-ecs-render-system = MIXED_USAGE
sample20-ecs-scene-world = MIXED_USAGE
sample21-ui-overlay = MIXED_USAGE
sample22-entity-lifecycle = MIXED_USAGE
sample23-debug-stats = MIXED_USAGE
sample24-data-driven-world = MIXED_USAGE
sample25-camera-follow = MIXED_USAGE
sample26-camera-bounds = MIXED_USAGE
sample27-minimap = MIXED_USAGE
sample28-asset-registry = MIXED_USAGE
sample29-save-load-state = MIXED_USAGE
sample30-level-loader = MIXED_USAGE
sample31-animation-system = MIXED_USAGE
sample32-state-machine = MIXED_USAGE
sample33-interaction-system = MIXED_USAGE
sample34-projectile-system = MIXED_USAGE
sample35-enemy-patrol-ai = MIXED_USAGE
sample36-playable-micro-level = MIXED_USAGE
sample37-sprite-render-layer = MIXED_USAGE
sample38-animation-sprite-binding = MIXED_USAGE
sample39-z-layer-ordering = MIXED_USAGE
sample40-prefab-system = MIXED_USAGE
sample41-game-mode-state = MIXED_USAGE
sample42-polished-playable-slice = MIXED_USAGE
sample43-sprite-atlas-image-rendering = MIXED_USAGE
sample44-camera-system = MIXED_USAGE
sample45-tilemap-system = MIXED_USAGE
sample46-input-action-mapping = MIXED_USAGE
sample47-world-serialization = MIXED_USAGE
sample48-tile-camera-sprite-slice = MIXED_USAGE
sample49-real-sprite-rendering = MIXED_USAGE
sample50-animation-system = MIXED_USAGE
sample51-physics-system = MIXED_USAGE
sample52-collision-resolution = MIXED_USAGE
sample53-tile-metadata = MIXED_USAGE
sample54-nes-style-zones-parallax = MIXED_USAGE
sample55-slopes-ramps = MIXED_USAGE
sample56-gravity-zones = MIXED_USAGE
sample57-ladders-climb-zones = MIXED_USAGE
sample58-moving-platforms = MIXED_USAGE
sample59-one-way-platforms = MIXED_USAGE
sample60-friction-surfaces = MIXED_USAGE
sample61-trigger-zones = MIXED_USAGE
sample62-pickups-collectibles = MIXED_USAGE
sample63-switches-buttons = MIXED_USAGE
sample64-doors-gates = MIXED_USAGE
sample65-basic-npc-entity = MIXED_USAGE
sample66-interaction-press-key = MIXED_USAGE
sample67-hitboxes-hurtboxes = MIXED_USAGE
sample68-projectile-system = MIXED_USAGE
sample69-health-system = MIXED_USAGE
sample70-damage-knockback = MIXED_USAGE
sample71-invulnerability-frames = MIXED_USAGE
sample72-simple-enemy-ai = MIXED_USAGE
sample73-camera-dead-zone = MIXED_USAGE
sample74-camera-look-ahead = MIXED_USAGE
sample75-camera-smoothing = MIXED_USAGE
sample76-camera-bounds = MIXED_USAGE
sample77-camera-shake = MIXED_USAGE
sample78-camera-zoom = MIXED_USAGE
sample79-input-buffering = MIXED_USAGE
sample80-input-queue-priority = MIXED_USAGE
sample81-input-timing-windows = MIXED_USAGE
sample82-action-cooldowns = MIXED_USAGE
sample83-input-chaining = MIXED_USAGE
sample84-input-state-debug-overlay = MIXED_USAGE
sample85-hitboxes-hurtboxes = MIXED_USAGE
sample86-attack-timing-windows = MIXED_USAGE
sample87-damage-invulnerability = MIXED_USAGE
sample88-knockback-response = MIXED_USAGE
sample89-health-death-state = MIXED_USAGE
sample90-combat-debug-overlay = MIXED_USAGE
sample91-event-bus = MIXED_USAGE
sample92-state-machine-framework = MIXED_USAGE
sample93-config-system = MIXED_USAGE
sample94-asset-loader-system = MIXED_USAGE
sample95-debug-tools = MIXED_USAGE
sample96-performance-metrics = MIXED_USAGE
sample97-grid-pathfinding = MIXED_USAGE
sample98-patrol-ai = MIXED_USAGE
sample99-chase-evade-ai = MIXED_USAGE
sample100-state-driven-ai = MIXED_USAGE
sample101-group-behaviors = MIXED_USAGE
sample102-quest-system = MIXED_USAGE
sample103-scripting-system = MIXED_USAGE
sample104-cutscene-system = MIXED_USAGE
sample105-spawn-system = MIXED_USAGE
sample106-day-night-cycle = MIXED_USAGE
sample107-weather-system = MIXED_USAGE
sample107a-weather-animation = MIXED_USAGE
sample108-world-streaming = MIXED_USAGE
sample109-input-remapping = MIXED_USAGE
sample110-controller-support = MIXED_USAGE
sample111-resolution-scaling = MIXED_USAGE
sample112-mobile-support = MIXED_USAGE
sample113-asset-optimization = MIXED_USAGE
sample114-memory-management = MIXED_USAGE
sample115-save-compression = MIXED_USAGE
sample116-replay-system = MIXED_USAGE
sample117-mini-map-system = MIXED_USAGE
sample118-achievements-system = MIXED_USAGE
sample119-localization-system = MIXED_USAGE
sample120-packaging-build-system = MIXED_USAGE
sample121-fullscreen-ability = MIXED_USAGE
sample122-audio-system = MIXED_USAGE
sample123-midi-player = MIXED_USAGE
sample124-synthesizer = MIXED_USAGE
sample125-frequency-player = MIXED_USAGE
sample126-particle-fx = MIXED_USAGE
sample127-ui-framework = MIXED_USAGE
sample128-input-context-system = MIXED_USAGE
sample129-scene-transitions = MIXED_USAGE
sample130-save-slots-profiles = MIXED_USAGE
sample131-logging-error-system = MIXED_USAGE
sample132-vector-rendering-system = MIXED_USAGE
sample133-polygon-collision = MIXED_USAGE
sample134-point-in-polygon = MIXED_USAGE
sample135-raster-mask-collision = MIXED_USAGE
sample136-pixel-perfect-collision = MIXED_USAGE
sample137-hybrid-collision = MIXED_USAGE
sample138-mp3-player = MIXED_USAGE
sample139-cookie-write-read-system = MIXED_USAGE
sample140-audio-playlist-track-management = MIXED_USAGE
sample141-settings-system = MIXED_USAGE
sample142-accessibility-options = MIXED_USAGE
sample143-deployment-profiles = MIXED_USAGE
sample144-distribution-packaging = MIXED_USAGE
sample145-crash-recovery-fallback-flow = MIXED_USAGE
sample146-release-validation-checklist-flow = MIXED_USAGE
sample147-networking-layer = MIXED_USAGE
sample148-state-sync-replication = MIXED_USAGE
sample149-client-prediction-reconciliation = MIXED_USAGE
sample150-serialization-system = MIXED_USAGE
sample151-network-debug-overlay = MIXED_USAGE
sample152-remote-entity-interpolation = MIXED_USAGE
sample153-lobby-session-system = MIXED_USAGE
sample154-host-server-bootstrap = MIXED_USAGE
sample155-interest-management = MIXED_USAGE
sample156-lag-packet-loss-simulation = MIXED_USAGE
sample157-chat-presence-layer = MIXED_USAGE
sample158-rollback-replay-diagnostics = MIXED_USAGE
sample159-level-editor = MIXED_USAGE
sample160-tile-map-editor = MIXED_USAGE
sample161-entity-placement-editor = MIXED_USAGE
sample162-timeline-cutscene-editor = MIXED_USAGE
sample163-automated-test-runner = MIXED_USAGE
sample164-regression-playback-harness = MIXED_USAGE
sample165-performance-benchmark-runner = MIXED_USAGE
sample166-ci-validation-flow = MIXED_USAGE
sample167-packet-validation-anti-cheat = MIXED_USAGE
sample168-save-data-integrity-checks = MIXED_USAGE
sample169-permissions-capability-gating = MIXED_USAGE
sample170-trust-session-validation = MIXED_USAGE
sample171-asset-import-pipeline = MIXED_USAGE
sample172-texture-sprite-preprocess-pipeline = MIXED_USAGE
sample173-audio-preprocess-pipeline = MIXED_USAGE
sample174-content-versioning-migration = MIXED_USAGE
sample175-build-asset-manifest-system = MIXED_USAGE
sample176-content-validation-pipeline = MIXED_USAGE
sample177-developer-console = MIXED_USAGE
sample178-in-engine-inspector = MIXED_USAGE
sample179-property-editor = MIXED_USAGE
sample180-live-tuning-hot-reload = MIXED_USAGE
sample181-asset-browser = MIXED_USAGE
sample182-scene-graph-entity-hierarchy-viewer = MIXED_USAGE
Asteroids = MIXED_USAGE
```

## Small BUILD_PR Alignment Ladder

### BUILD_PR 1 - Scene Barrel Normalization
Scope:
- replace `engine/scenes/Scene.js` imports in samples and Asteroids with `engine/scenes/index.js`

Why first:
- this is the dominant repo-wide drift
- it is mechanical
- it aligns the public scene/lifecycle surface without behavior changes

### BUILD_PR 2 - Asteroids Barrel Cleanup
Scope:
- switch Asteroids deep imports from:
  - `engine/fx/ParticleSystem.js`
  - `engine/collision/polygon.js`
  - `engine/utils/math.js`
  - `engine/tooling/CapturePreviewRuntime.js`
- to the corresponding public barrels

Why second:
- narrow game-only surface
- all replacements are already proven public exports
- easy to validate with existing Asteroids tests and boot checks

### BUILD_PR 3 - Import Consistency Validation
Scope:
- add a focused audit test or lint-style validation that fails on new deep imports into engine subsystems that already publish a barrel

Why third:
- prevents reintroduction after alignment
- keeps later sample/game additions consistent

## Recommended No-Guess Policy For Follow-Up PRs
- Do not change runtime behavior while aligning imports.
- Treat `engine/core/Engine.js` as the only approved direct engine file import in this audit unless a subsystem lacks a barrel.
- If a future sample/game needs a deep file because the barrel does not export the symbol, add that proof to the next docs pass instead of silently bypassing the public surface.

## No-Behavior-Change Statement
This PR documents the current engine class/module usage across samples and games.

It does not modify runtime source files, gameplay, rendering, or engine behavior.
