# HTML-JavaScript-Gaming

A browser-based 2D game development repository built with HTML5 Canvas, vanilla JavaScript, and reusable engine modules.

This repo is organized around a shared `engine/` plus a set of playable `games/`, focused `samples/`, utility `tools/`, and supporting `docs/`.

## What is in this repo

### Shared engine

The [`engine/`](./engine/) folder contains the reusable framework code used across the projects in this repository, including:

- game bootstrapping and animation loop
- shared runtime orchestration through `GameBase` and `RuntimeContext`
- canvas helpers and rendering utilities
- keyboard, mouse, and controller input
- animation helpers for sprite and PNG workflows
- game-facing object, registry, collision, and system APIs under `engine/game/`
- shared object classes and lifecycle helpers
- math and physics helpers
- sprite, PNG sprite-sheet, and tile-map support
- event messaging
- audio, MIDI, and synthesizer output

The main runtime entry point is [`engine/core/gameBase.js`](./engine/core/gameBase.js), working with [`engine/core/runtimeContext.js`](./engine/core/runtimeContext.js).

### Playable games

The [`games/`](./games/) folder contains complete browser games and gameplay prototypes, including:

- Asteroids
- Frogger
- Snake
- Space Invaders
- Pong Game
- Connect 4
- Tic-Tac-Toe
- Box Drop
- Solar System Sample

Each game usually includes its own `index.html`, `game.js`, `global.js`, styles, and game-specific classes/assets.

### Samples

The [`samples/`](./samples/) folder contains focused demos for individual engine features, such as:

- 2D side scroll tile map
- Draw Shapes
- Move Objects
- Full Screen Gaming
- Solar System
- keyboard input
- mouse input
- controllers
- audio
- MIDI playback
- particles
- synthesizer output
- a sample engine-based game shell

### Tools

The [`tools/`](./tools/) folder contains utility projects. The main tool currently in the repo is:

- [`tools/SpriteEditor/`](./tools/SpriteEditor/) for sprite editing and sprite workflow experiments

### Documentation

The [`docs/`](./docs/) folder contains project documentation, including:

- [`docs/getting-started.md`](./docs/getting-started.md)
- [`docs/game-engine-architecture.md`](./docs/game-engine-architecture.md)
- [`docs/engine-api-conventions.md`](./docs/engine-api-conventions.md)
- [`docs/sprite-system.md`](./docs/sprite-system.md)

## Repository layout

```text
index.html        Root launcher page
engine/           Shared framework code
games/            Full game implementations
samples/          Focused demos for individual subsystems
tools/            Utility applications
docs/             Documentation
scripts/          Repository automation scripts
tests/            Engine test suite and manifest
```

## Running the project

Because the repo uses JavaScript modules, run it through a local web server instead of opening files directly with `file:///`.

### Option 1: VS Code Live Server

1. Open the repository in VS Code.
2. Install the Live Server extension if needed.
3. Open [`index.html`](./index.html) with Live Server.

### Option 2: Python

From the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Running tests

From the repository root:

```bash
npm test
```

`npm test` runs `scripts/run-node-tests.mjs`, which executes the shared test manifest at `tests/engine/testManifest.js`.
The default suite is Node-safe and includes engine tests across animation, core, game, input, lifecycle, math, messages, misc, objects, output, physics, renderers, and utils.

## Recommended first run

Start with the root [`index.html`](./index.html) launcher page. It gives you one place to open games, samples, tools, and docs.

Good first stops are:

- [`games/Asteroids/`](./games/Asteroids/)
- [`games/Frogger/`](./games/Frogger/)
- [`samples/Solar%20System/`](./samples/Solar%20System/)
- [`samples/2D%20side%20scroll%20tile%20map/`](./samples/2D%20side%20scroll%20tile%20map/)
- [`samples/Game%20Engine/`](./samples/Game%20Engine/)
- [`tools/SpriteEditor/`](./tools/SpriteEditor/)

If you want a quick orientation path:

1. Open the root launcher page.
2. Run [`samples/Game%20Engine/`](./samples/Game%20Engine/).
3. Open [`samples/Solar%20System/`](./samples/Solar%20System/) to compare a small engine-driven sample with a real project folder.
4. Read [`docs/game-engine-architecture.md`](./docs/game-engine-architecture.md).
5. Open [`games/Asteroids/`](./games/Asteroids/).

## Typical project flow

Most game folders follow this pattern:

1. `index.html` loads a game-specific `game.js` module.
2. `game.js` imports shared code from `engine/` and usually extends `GameBase`.
3. `GameBase` initializes shared services through `RuntimeContext`.
4. `onInitialize(runtimeContext)` loads game-specific state, assets, and input.
5. `gameLoop(deltaTime, runtimeContext)` updates and draws gameplay each animation frame.

## Engine overview

The engine is organized into a few clear layers:

- `engine/core/` for the runtime shell, canvas helpers, and tile-map support
- `engine/game/` for canonical game-facing object, registry, collision, and system APIs
- `engine/animation/` for sprite and PNG animation controllers
- `engine/input/` for keyboard, mouse, and controller input
- `engine/objects/` for reusable object types like static, dynamic, killable, sprite, PNG, and vector objects
- `engine/math/` and `engine/physics/` for low-level helpers
- `engine/renderers/` for box, sprite, PNG, vector, and particle rendering
- `engine/messages/` for event-style communication
- `engine/output/` for audio, MIDI, and synthesizer support

## Sprite workflows

The repo currently supports two main sprite paths:

- `ObjectSprite` for frame-array or JSON/palette sprites
- `ObjectPNG` for PNG sprite-sheet rendering

The current game-facing `GameObject` facade extends `ObjectPNG`, so PNG-backed sprite sheets are the default path in the newer `engine/game/` layer.

For more detail, see [`docs/sprite-system.md`](./docs/sprite-system.md).

## Documentation

If you are exploring or contributing, these are the best docs to read first:

- [`docs/getting-started.md`](./docs/getting-started.md)
- [`docs/game-engine-architecture.md`](./docs/game-engine-architecture.md)
- [`docs/engine-api-conventions.md`](./docs/engine-api-conventions.md)
- [`docs/sprite-system.md`](./docs/sprite-system.md)

## Built with

- HTML5 Canvas
- Vanilla JavaScript (ES modules)
- CSS

## License

This repository is licensed under the terms of the [`LICENSE`](./LICENSE) file.

