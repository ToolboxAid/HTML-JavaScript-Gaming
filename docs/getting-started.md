# Getting Started

## Repo Shape

```text
engine/   Shared engine code
games/    Playable games
samples/  Focused demos and proofs
tests/    Node-safe automated tests
docs/     Kept reference documentation
scripts/  Test and manifest automation
tools/    Repo utilities
```

## Current Launchers
- Root hub: `index.html`
- Samples: `samples/index.html` (covers 001-182)
- Games: `games/index.html` (Arcade + AI tracks)
- Direct game entries: Asteroids, Space Duel, Space Invaders, Pacman Lite, Pacman Full AI, AI Target Dummy

## Running Locally
Serve the repo from a local web server:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`

## Running Tests

```bash
npm test
```

Useful extra command:

```bash
npm run build:manifest
```

Regenerates `docs/build/sample-manifest.json`.

## Current Engine Usage Rule
- Import `Engine` from `engine/core/Engine.js`
- Prefer `engine/<subsystem>/index.js` when a public barrel exists

Examples:
- `engine/scenes/index.js`
- `engine/input/index.js`
- `engine/theme/index.js`
- `engine/collision/index.js`
- `engine/utils/index.js`

## Suggested First Pass
1. Open the root launcher.
2. Open the sample launcher and browse a few numbered samples.
3. Launch games from `games/index.html` (start with Asteroids, Space Duel, then Space Invaders).
4. Try the AI track: Pacman Lite, Pacman Full AI, AI Target Dummy.
5. Read `engine/README.md`.
6. Read `docs/architecture/README.md` and `docs/standards/engine-standards.md`.
