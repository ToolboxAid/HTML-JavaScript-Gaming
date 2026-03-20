# Getting Started

HTML JavaScript Gaming is a browser-based 2D game development repo built around a shared engine, playable games, focused samples, and a few tooling projects.

## Repository layout

```text
engine/   Shared runtime, utilities, rendering, input, physics, objects, and messaging
games/    Playable game projects built on the engine
samples/  Small focused demos for a single subsystem or feature
tools/    Utility apps such as the sprite editor
docs/     Project documentation
scripts/  Repository automation scripts (including test runner)
tests/    Engine test suite and manifest
```

## What is in the repo

The codebase is organized around a reusable engine and a growing set of examples.

- `engine/` contains the shared runtime pieces such as `gameBase.js`, `runtimeContext.js`, input handlers, game-facing object APIs, rendering helpers, animation helpers, object classes, math utilities, physics helpers, messaging, audio output, and tile-map support.
- `games/` contains complete browser games like Asteroids, Frogger, Pong, Snake, Space Invaders, and a side-scrolling tile-map demo.
- `samples/` is capability-grouped:
  - `samples/input/` for keyboard, mouse, and controller demos
  - `samples/output/` for audio, MIDI, and synthesizer demos
  - `samples/visual/` for drawing, movement, particle, and fullscreen demos
  - `samples/engine/` for engine-shell and system-oriented demos
- `tools/` currently includes the Sprite Editor.

## Running the project

Because this repo uses JavaScript modules, run it from a local web server instead of opening files directly with `file:///`.

### Option 1: VS Code Live Server

1. Open the repo in Visual Studio Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` in the project root.
4. Choose **Open with Live Server**.

### Option 2: Python

From the project root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Running tests

From the project root:

```bash
npm test
```

This runs `scripts/run-node-tests.mjs`, which loads test entries from `tests/engine/testManifest.js`.
The default suite is Node-safe and covers engine domains across animation, core, game, input, lifecycle, math, messages, misc, objects, output, physics, renderers, and utils.

## Recommended first run

Start with the root `index.html` launcher page. It gives you one place to open:

- playable games
- engine samples
- tools
- project documentation

After that, good first stops are:

- `games/Asteroids/`
- `games/Frogger/`
- `samples/visual/Solar System/`
- `samples/engine/2D side scroll tile map/`
- `samples/engine/Game Engine/`
- `tools/SpriteEditor/`

If you want the quickest orientation path, use this order:

1. Open the root launcher page.
2. Launch `samples/engine/Game Engine/`.
3. Launch `samples/visual/Solar System/` to see a compact engine-driven sample with states, input, zoom, focus, and `GameObjectSystem` ownership.
4. Read `docs/architecture/engine-api-boundary.md` and `docs/standards/engine-standards.md`.
6. Open `games/Asteroids/` to see a more complete engine-driven game.

## Core runtime flow

Most game projects follow the same pattern:

1. An `index.html` page loads a game-specific `game.js` module.
2. `game.js` imports shared engine modules and usually extends `GameBase`.
3. `GameBase` initializes shared services through `RuntimeContext`.
4. `onInitialize(runtimeContext)` wires up game-specific assets, input, and state.
5. `gameLoop(deltaTime, runtimeContext)` updates and draws gameplay each animation frame.

At the center of that flow is `engine/core/gameBase.js`, working with `engine/core/runtimeContext.js` to initialize canvas, fullscreen support, performance monitoring, and shared timer visibility handling before the main animation loop begins.

## Engine areas to know first

### `engine/core/gameBase.js`
Base class for bootstrapping a game and running the animation loop.

### `engine/core/runtimeContext.js`
Facade around shared engine services such as canvas, fullscreen, performance, and timer visibility integration.

### `engine/game/`
Canonical game-facing object, collision, registry, and system APIs.

### `engine/input/`
Keyboard, mouse, and controller input handling.

### `engine/animation/`
Sprite and PNG animation controllers plus state-bridge helpers.

### `engine/objects/`
Shared object classes such as static, dynamic, sprite, PNG, vector, and killable object types.

### `engine/physics/`
Collision and movement helpers.

### `engine/math/`
Geometry, angles, and random helpers.

### `engine/messages/`
Event-bus style messaging and sender/receiver helpers.

### `engine/output/`
Audio, MIDI, and synthesizer support.

### `engine/core/tileMap.js`
Tile-map and side-scrolling support.

## Suggested learning path

If you are new to this repo, work through it in this order:

1. Run the root `index.html` launcher.
2. Read `docs/architecture/engine-api-boundary.md` and `docs/standards/engine-standards.md`.
4. Run `samples/engine/Game Engine/`.
5. Open `samples/visual/Solar System/` to see a small engine sample inside a real project folder.
6. Open `games/Asteroids/` to see a compact arcade-style implementation.
7. Open `games/Frogger/` for a larger project with more systems and assets.
8. Open `samples/engine/2D side scroll tile map/` to study map scrolling.
9. Read `docs/sprite-system.md` before expanding sprite-heavy projects.

## Sample Order by Inheritance

If you want to learn the engine from the bottom up, the sample folders make the most sense in an inheritance-first order:

1. `samples/visual/Draw Shapes/`
   Start with basic drawing through the shared game shell.
2. `samples/visual/Move Objects/`
   Add simple update-loop behavior and object motion.
3. `samples/input/Keyboard/`
   Learn engine-owned keyboard input and frame-based key states.
4. `samples/input/Mouse/`
   Add mouse input concepts, even though this sample is less aligned with `GameBase`.
5. `samples/input/GameControllers/`
   Extend that input path into controller and gamepad support.
6. `samples/engine/Game Engine/`
   Study the fuller engine shell once drawing, movement, and input basics are familiar.
7. `samples/visual/Solar System/`
   See a more complete engine-driven sample with state, config-driven setup, and `GameObjectSystem` ownership.
8. `samples/engine/2D side scroll tile map/`
   Move into larger structure with attract flow, scrolling, and map-oriented behavior.
9. `samples/visual/Particle/`
   Explore specialized rendering and effects after the main runtime model is clear.
10. `samples/output/Audio/`
11. `samples/output/MIDI Player/`
12. `samples/output/Synthesizer/`
   Treat the output/audio samples as later-stage subsystem study rather than the core engine path.

## Adding a new game

A practical way to add a new game is:

1. Copy the structure of a small existing game.
2. Keep the new project inside `games/Your Game Name/`.
3. Point `index.html` to a module-based `game.js`.
4. Reuse engine code instead of duplicating utilities.
5. Add the game to the root launcher page.

In practice, the smoothest starting point is often `samples/engine/Game Engine/` or another small existing project rather than starting from an empty folder.

## Current direction of the repo

This project has moved beyond isolated experiments. The current structure supports the next step: treating `engine/` as the shared framework layer, using `engine/game/` as the canonical game-facing API surface, and keeping `games/`, `samples/`, and `tools/` as clean consumers of that framework.


