# Game Engine Architecture

This repo is organized as a lightweight browser game framework with a clear split between shared engine code and game-specific code.

## Top-level architecture

```text
index.html        Project launcher
engine/           Shared framework code
games/            Full game implementations
samples/          Narrow feature demos and experiments
tools/            Utility applications
docs/             Documentation
scripts/          Repository automation scripts (including test runner)
tests/            Engine test suite and manifest
```

The design goal is simple: put reusable systems in `engine/`, and keep each game focused on rules, assets, and behavior.

One good current example is `games/Solar System/`, which now runs as an engine-driven sample using `GameBase`, engine-owned keyboard input, and `GameObjectSystem` ownership for its active celestial bodies.

## High-level runtime model

The current runtime centers around `GameBase` plus `RuntimeContext`.

```text
Game index.html
  -> game.js
    -> GameBase constructor
      -> RuntimeContext.initialize(...)
        -> canvas setup
        -> fullscreen setup
        -> performance monitor setup
      -> game-specific onInitialize(runtimeContext)
      -> requestAnimationFrame loop
        -> GameBase.animate(timestamp)
          -> clear canvas
          -> gameLoop(deltaTime, runtimeContext)
          -> draw border/fullscreen/performance overlays
      -> page visibility hooks pause/resume shared timers
```

## Core engine layers

### 1. Boot and loop

`engine/core/gameBase.js` is the entry point for frame-based runtime behavior, and `engine/core/runtimeContext.js` is the shared facade around engine singletons used by that runtime shell.

Responsibilities:

- initialize canvas, fullscreen, and performance services through `RuntimeContext`
- call game-specific startup through `onInitialize(runtimeContext)`
- run the main animation loop
- compute `deltaTime`
- clear and decorate the canvas each frame
- react to `visibilitychange` and `pagehide`
- pause and resume shared timers when the page is hidden or shown

This pair is effectively the current engine shell.

## 2. Input layer

The input layer lives under `engine/input/`.

Current focus:

- `keyboard.js`
- `mouse.js`
- `controller/` (gamepad manager, mapper, state, enums, debugger, and facade)

The keyboard handler tracks three useful states:

- keys pressed this frame
- keys currently held down
- keys released this frame

That separation makes arcade-style controls easier to implement cleanly.

The same frame-state pattern also shows up in mouse and controller input, which keeps gameplay code consistent across devices.

## 3. Object layer

The repo uses shared object types under `engine/objects/`.

Important classes include:

- `objectStatic.js`
- `objectDynamic.js`
- `objectKillable.js`
- `objectSprite.js`
- `objectPNG.js`
- `objectVector.js`
- `objectSpriteFrameConfig.js`

This is one of the strongest parts of the current architecture. It gives the engine a reusable object model that can support both simple arcade games and more advanced sprite or tile-map projects.

### Object inheritance direction

A simplified view of the current pattern looks like this:

```text
ObjectStatic
  -> ObjectDynamic
    -> ObjectKillable
```

That progression maps well to typical game behavior:

- static objects define position and bounds
- dynamic objects add movement and collision behavior
- killable objects add state and life-cycle logic

Sprite, PNG, and vector specializations sit on top of that base and pair the object model with renderer-specific behavior.

## 4. Object system and lifecycle management

The canonical game-facing object system now lives under `engine/game/`:

- `gameObject.js`
- `gameObjectManager.js`
- `gameObjectRegistry.js`
- `gameObjectSystem.js`
- `gameCollision.js`
- `gameObjectUtils.js`
- `gameUtils.js`

Compatibility re-exports still exist at the top of `engine/` for some modules, but `engine/game/` is the source of truth.

### `GameObjectManager`
Manages the list of active objects and owns add/remove/destroy behavior for that collection.

### `GameObjectRegistry`
Provides lookup and registration behavior.

### `GameObjectSystem`
Coordinates the manager, registry, and collision facade so objects can be added, found, removed, queried, and cleared through one system boundary.

### `GameCollision`
Provides the canonical game-level collision and bounds API on top of the lower-level physics helpers.

Architecturally, this is the bridge from ad hoc object arrays toward a cleaner world/entity system.

`games/Solar System/` is a concrete example of this direction: the sample uses `GameObjectSystem` to own active simulation objects while keeping the game shell focused on input, state, update, and render flow.

Related lifecycle support also exists in `engine/lifecycle/objectLifecycle.js`, which centralizes status-based object state used by killable objects and animation flows.

## 5. Animation and state helpers

Animation support now has its own dedicated layer under `engine/animation/`.

Key files include:

- `spriteController.js`
- `pngController.js`
- `animationStateBridge.js`
- `stateUtils.js`

This layer keeps frame progression and animation-state cleanup out of the base object classes, which is a healthy separation as sprite-heavy games become more complex.

## 6. Math and physics

The engine separates supporting calculations into dedicated folders.

### `engine/math/`
Contains helpers for:

- angles
- geometry
- random utilities

### `engine/physics/`
Contains helpers for:

- collision detection
- movement and physics utilities
- boundary checks and wraparound helpers
- vector-shape helpers for more advanced geometry cases

This is a good design choice because it keeps low-level logic reusable across multiple games.

## 7. Rendering and graphics

Rendering responsibilities are centered in `engine/core` and `engine/renderers`.

Key files include:

- `engine/core/canvas.js`
- `engine/core/sprite.js`
- `engine/core/tileMap.js`
- `engine/renderers/boxRenderer.js`
- `engine/renderers/spriteRenderer.js`
- `engine/renderers/pngRenderer.js`
- `engine/renderers/vectorRenderer.js`
- `engine/renderers/particleExplosion.js`
- `engine/renderers/assets/`

At a practical level, the engine already supports:

- canvas drawing
- color helpers
- sprite-based rendering
- PNG sprite-sheet rendering
- vector-style rendering
- tile-map rendering
- particle effects
- parallax-style scrolling logic in the tile-map support
- renderer safety guards and shared debug-gated logging

## 8. Messaging and decoupling

The messaging layer lives under `engine/messages/`.

Files include:

- `eventBus.js`
- `sender.js`
- `receiver.js`

This enables event-style communication between systems without tightly coupling every game component together.

That becomes more valuable as projects grow larger.

## 9. Output and audio

The repo also has a dedicated output layer:

- `audioPlayer.js`
- `midiPlayer.js`
- `synthesizer.js`
- `audioFrequency.js`

This is a strong sign that the repo is evolving from a graphics-only sandbox into a broader game framework.

## 10. Utility and support layers

Several support folders round out the engine:

- `engine/utils/` for validation, timers, asset-state helpers, cleanup, and debug helpers
- `engine/misc/` for browser-adjacent helpers such as cookies
- `engine/ai/` for pathfinding utilities

These are less visible than the main runtime path, but they help keep cross-cutting logic out of gameplay code.

## 11. Tile-map support

`engine/core/tileMap.js` shows the engine already supports a scrolling map model.

The current tile-map implementation includes:

- layered map data
- per-layer speed handling
- hero-centered horizontal scrolling
- tile drawing by visible region

That makes it a useful foundation for side scrollers, exploration games, and multi-layer backgrounds.

## Architecture strengths

The current engine already has several solid qualities.

### Shared code is centralized
The move into `engine/` is the right direction. It reduces duplication and makes future cleanup easier.

### Systems are separated by responsibility
Input, animation, math, physics, objects, messaging, output, rendering, and utility concerns each have their own area.

### Object modeling is reusable
The object class hierarchy gives the repo a stable base for many types of 2D games.

### Samples, games, and tools are separate
This makes the repository easier to navigate and easier to grow.

## Recommended evolution from here

The next architectural step is to formalize a few concepts that are already emerging.

### Add a scene layer
A `Scene` abstraction would help separate title screens, gameplay, pause screens, and game-over states.

Suggested direction:

```text
engine/game/
  Game.js
  Scene.js
  SceneManager.js
```

### Add a world layer
`GameObjectSystem` now acts as the main world-facing facade for object orchestration and collision access. A future explicit `World` abstraction can still improve scene-level composition.

### Standardize update vs render
Long-term, game code becomes easier to maintain when logic update and visual render are clearly separated.

### Formalize camera support
The tile-map work is already doing some camera-like work. Making camera behavior explicit would help side scrollers and larger maps.

## Practical mental model

A useful way to think about the current architecture is:

```text
engine/
  core runtime
  + input
  + animation
  + object model
  + game-facing facades
  + math
  + physics
  + rendering
  + audio
  + messaging
  + utilities

games/
  game-specific rules and scenes

samples/
  isolated demonstrations of one subsystem

tools/
  development helpers
```

That is a strong and scalable direction for the repo.

## Testing architecture

The default automated engine suite is manifest-driven:

```text
npm test
  -> scripts/run-node-tests.mjs
    -> tests/engine/testManifest.js
      -> tests/engine/<domain>/*Test.js entries
```

Current manifest coverage spans animation, core, game, input, lifecycle, math, messages, misc, objects, output, physics, renderers, and utils.

This keeps test execution centralized while allowing coverage across engine domains without coupling tests to browser-only runtime behavior.

