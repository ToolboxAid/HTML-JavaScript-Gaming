Toolbox Aid
David Quesenberry
03/23/2026
README.md

# HTML JavaScript Gaming

Browser-based game development repo built around a shared JavaScript engine, a large sample catalog, and one shipped game: Asteroids.

## What Is Here
- `engine/` contains the shared runtime and public subsystem barrels
- `games/Asteroids/` contains the current playable game
- `samples/` contains the numbered engine/sample demos plus shared sample infrastructure
- `tests/` contains the Node-safe automated test suite
- `docs/` contains the kept architecture, standards, and getting-started docs
- `scripts/` contains test and sample-manifest automation

## Current Entry Points
- Root launcher: `index.html`
- Games launcher: `games/index.html`
- Samples launcher: `samples/index.html`
- Asteroids: `games/Asteroids/index.html`

## Running Locally
Serve the repo from a local web server because the project uses ES modules.

Example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Tests
Run the automated suite from the repo root:

```bash
npm test
```

The suite runs `scripts/run-node-tests.mjs` and covers core engine timing/lifecycle behavior, public import guardrails, persistence, FX determinism, and Asteroids validation/stress coverage.

## Sample And Game Notes
- `samples/` is the main proof surface for engine subsystems and patterns
- `_shared/` under `samples/` contains shared sample-owned bootstrap/layout helpers
- `games/` currently ships Asteroids only
- `docs/build/sample-manifest.json` is generated data used by packaging/sample-manifest flows; regenerate it with `npm run build:manifest`

## Engine Import Rule
- `engine/core/Engine.js` is the approved direct engine boot import
- when an engine subsystem exposes `engine/<subsystem>/index.js`, samples and games should prefer that barrel

## Docs Worth Reading First
- [docs/getting-started.md](docs/getting-started.md)
- [docs/repo-directory-structure.md](docs/repo-directory-structure.md)
- [docs/architecture/README.md](docs/architecture/README.md)
- [docs/standards/engine-standards.md](docs/standards/engine-standards.md)
- [engine/README.md](engine/README.md)
