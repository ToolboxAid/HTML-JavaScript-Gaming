# HTML-JavaScript-Gaming

A browser-based 2D game development repository built with HTML5 Canvas, vanilla JavaScript, and reusable engine modules.

This repo is organized around a shared `engine/` plus a set of playable `games/`, focused `samples/`, utility `tools/`, and supporting `docs/`.

## What is in this repo

### Shared engine

The [`engine/`](./engine/) folder contains the reusable framework code used across the projects in this repository, including:

- game bootstrapping and animation loop
- canvas helpers and rendering utilities
- keyboard, mouse, and controller input
- math and physics helpers
- sprites and tile-map support
- game object classes and object lifecycle helpers
- event messaging
- audio, MIDI, and synthesizer output

The main runtime entry point is [`engine/core/gameBase.js`](./engine/core/gameBase.js).

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
- Draw Shapes
- Move Objects
- Full Screen Gaming
- Solar System (outdated)
- Solar System - w-classes
- 2D side scroll tile map (not complete)
- Break Out (not complete)
- Tank w-pathfind (not complete)

Each game usually includes its own `index.html`, `game.js`, `global.js`, styles, and game-specific classes/assets.

### Samples

The [`samples/`](./samples/) folder contains focused demos for individual engine features, such as:

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
- [`docs/sprite-system.md`](./docs/sprite-system.md)

## Repository layout

```text
index.html        Root launcher page
engine/           Shared framework code
games/            Full game implementations
samples/          Focused demos for individual subsystems
tools/            Utility applications
docs/             Documentation
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

## Recommended starting points

Start with the root [`index.html`](./index.html) launcher page. From there, good entry points are:

- [`games/Asteroids/`](./games/Asteroids/)
- [`games/Frogger/`](./games/Frogger/)
- [`games/2D%20side%20scroll%20tile%20map/`](./games/2D%20side%20scroll%20tile%20map/)
- [`samples/Sample%20Game%20Engine/`](./samples/Sample%20Game%20Engine/)
- [`tools/SpriteEditor/`](./tools/SpriteEditor/)

## Typical project flow

Most game folders follow this pattern:

1. `index.html` loads a game-specific `game.js` module.
2. `game.js` imports shared code from `engine/`.
3. A game class extends `GameBase`.
4. The engine runs the update/render loop on the canvas.

## Built with

- HTML5 Canvas
- Vanilla JavaScript (ES modules)
- CSS

## License

This repository is licensed under the terms of the [`LICENSE`](./LICENSE) file.

