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
```

The design goal is simple: put reusable systems in `engine/`, and keep each game focused on rules, assets, and behavior.

## High-level runtime model

The current runtime centers around `GameBase`.

```text
Game index.html
  -> game.js
    -> GameBase initialization
      -> canvas setup
      -> fullscreen setup
      -> performance monitor setup
      -> game-specific onInitialize()
      -> requestAnimationFrame loop
        -> gameLoop(deltaTime)
        -> render to canvas
```

## Core engine layers

### 1. Boot and loop

`engine/core/gameBase.js` is the entry point for frame-based runtime behavior.

Responsibilities:

- initialize canvas utilities
- initialize fullscreen support
- initialize performance monitor
- call game-specific startup through `onInitialize()`
- run the main animation loop
- compute `deltaTime`
- clear and decorate the canvas each frame

This file is effectively the current engine shell.

## 2. Input layer

The input layer lives under `engine/input/`.

Current focus:

- `keyboard.js`
- `mouse.js`
- `controller/` (gamepad manager, mapper, and state)

The keyboard handler tracks three useful states:

- keys pressed this frame
- keys currently held down
- keys released this frame

That separation makes arcade-style controls easier to implement cleanly.

## 3. Object layer

The repo uses shared object types under `engine/objects/`.

Important classes include:

- `objectStatic.js`
- `objectDynamic.js`
- `objectKillable.js`
- `objectSprite.js`
- `objectPNG.js`
- `objectVector.js`

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

## 4. Object system and lifecycle management

The repo now includes:

- `gameObject.js`
- `gameObjectManager.js`
- `gameObjectRegistry.js`
- `gameObjectSystem.js`

This is the start of a stronger runtime management layer.

### `GameObjectManager`
Manages the list of active objects.

### `GameObjectRegistry`
Provides lookup and registration behavior.

### `GameObjectSystem`
Coordinates the manager and registry so objects can be added, found, removed, and cleared through one system boundary.

Architecturally, this is the bridge from ad hoc object arrays toward a cleaner world/entity system.

## 5. Math and physics

The engine separates supporting calculations into dedicated folders.

### `engine/math/`
Contains helpers for:

- angles
- geometry
- random utilities
- vector utilities

### `engine/physics/`
Contains helpers for:

- collision detection
- movement and physics utilities

This is a good design choice because it keeps low-level logic reusable across multiple games.

## 6. Rendering and graphics

Rendering responsibilities are centered in `engine/core` and `engine/renderers`.

Key files include:

- `engine/core/canvas.js`
- `engine/core/sprite.js`
- `engine/core/tileMap.js`
- `engine/renderers/`
- `engine/renderers/assets/`

At a practical level, the engine already supports:

- canvas drawing
- color helpers
- sprite-based rendering
- tile-map rendering
- parallax-style scrolling logic in the tile-map demo
- renderer safety guards and shared debug-gated logging

## 7. Messaging and decoupling

The messaging layer lives under `engine/messages/`.

Files include:

- `eventBus.js`
- `sender.js`
- `receiver.js`

This enables event-style communication between systems without tightly coupling every game component together.

That becomes more valuable as projects grow larger.

## 8. Output and audio

The repo also has a dedicated output layer:

- `audioPlayer.js`
- `midiPlayer.js`
- `synthesizer.js`
- `audioFrequency.js`

This is a strong sign that the repo is evolving from a graphics-only sandbox into a broader game framework.

## 9. Tile-map support

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
Input, math, physics, objects, messaging, output, and rendering each have their own area.

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
  + object model
  + math
  + physics
  + rendering
  + audio
  + messaging

games/
  game-specific rules and scenes

samples/
  isolated demonstrations of one subsystem

tools/
  development helpers
```

That is a strong and scalable direction for the repo.

