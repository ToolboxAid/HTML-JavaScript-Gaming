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

- `engine/` contains the shared runtime pieces such as `gameBase.js`, input handlers, rendering helpers, object classes, math utilities, physics helpers, messaging, audio output, and tile-map support.
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

## Core runtime flow

Most game projects follow the same pattern:

1. An `index.html` page loads a game-specific `game.js` module.
2. The game bootstraps canvas and runtime setup.
3. The game builds or updates its objects.
4. The game renders to the canvas every animation frame.

At the center of that flow is `engine/core/gameBase.js`, which initializes the canvas, fullscreen support, and performance monitor, then runs the animation loop.

## Engine areas to know first

### `engine/core/gameBase.js`
Base class for bootstrapping a game and running the animation loop.

### `engine/input/`
Keyboard and mouse input handling.

### `engine/objects/`
Shared object classes such as static, dynamic, sprite, PNG, vector, and killable object types.

### `engine/physics/`
Collision and movement helpers.

### `engine/math/`
Geometry, angles, random helpers, and vector utilities.

### `engine/messages/`
Event-bus style messaging and sender/receiver helpers.

### `engine/output/`
Audio, MIDI, and synthesizer support.

### `engine/core/tileMap.js`
Tile-map and side-scrolling support.

## Suggested learning path

If you are new to this repo, work through it in this order:

1. Read `docs/game-engine-architecture.md`.
2. Run `samples/Sample Game Engine/`.
3. Open `games/Asteroids/` to see a compact arcade-style implementation.
4. Open `games/2D side scroll tile map/` to study map scrolling.
5. Read `docs/sprite-system.md` before expanding sprite-heavy projects.

## Adding a new game

A practical way to add a new game is:

1. Copy the structure of a small existing game.
2. Keep the new project inside `games/Your Game Name/`.
3. Point `index.html` to a module-based `game.js`.
4. Reuse engine code instead of duplicating utilities.
5. Add the game to the root launcher page.

## Current direction of the repo

This project has moved beyond isolated experiments. The current structure supports the next step: treating `engine/` as the shared framework layer and keeping `games/`, `samples/`, and `tools/` as clean consumers of that framework.

