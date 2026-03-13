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
- `samples/` contains smaller testbeds for keyboard, mouse, controllers, audio, MIDI, particles, and the sample game engine.
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
- `games/2D side scroll tile map/`
- `samples/Sample Game Engine/`
- `tools/SpriteEditor/`

If you want the quickest orientation path, use this order:

1. Open the root launcher page.
2. Launch `samples/Sample Game Engine/`.
3. Read `docs/game-engine-architecture.md`.
4. Open `games/Asteroids/` to see a more complete engine-driven game.

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
2. Read `docs/game-engine-architecture.md`.
3. Run `samples/Sample Game Engine/`.
4. Open `games/Asteroids/` to see a compact arcade-style implementation.
5. Open `games/Frogger/` for a larger project with more systems and assets.
6. Open `games/2D side scroll tile map/` to study map scrolling.
7. Read `docs/sprite-system.md` before expanding sprite-heavy projects.

## Adding a new game

A practical way to add a new game is:

1. Copy the structure of a small existing game.
2. Keep the new project inside `games/Your Game Name/`.
3. Point `index.html` to a module-based `game.js`.
4. Reuse engine code instead of duplicating utilities.
5. Add the game to the root launcher page.

In practice, the smoothest starting point is often `samples/Sample Game Engine/` or another small existing project rather than starting from an empty folder.

## Current direction of the repo

This project has moved beyond isolated experiments. The current structure supports the next step: treating `engine/` as the shared framework layer, using `engine/game/` as the canonical game-facing API surface, and keeping `games/`, `samples/`, and `tools/` as clean consumers of that framework.

