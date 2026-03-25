HTML JavaScript Gaming
======================

Vanilla JS/HTML game collection built on a lightweight custom engine. The repo ships browser-launchable samples, reusable controllers, and full arcade-style games - no build step required to play.

What's Included
---------------
- `engine/` - shared engine modules (rendering, input, scenes, AI, UI, etc.).
- `games/` - playable games such as Asteroids, Space Duel, Space Invaders, Pacman Lite, Pacman Full AI, and AI Target Dummy (launch via `games/index.html`).
- `samples/` - numbered micro-demos (001-182) covering mechanics and patterns (launch via `samples/index.html`).
- `docs/` - architecture, standards, and getting-started guides.
- `tests/` - 81 node-run tests covering engine and sample surfaces.
- `scripts/` & `tools/` - automation for manifests, audits, and repo utilities.

Current Status (03/25/2026)
---------------------------
- Samples 001-182 complete and published in the sample launcher.
- Level 4 "Classic Arcade" set shipped: Asteroids, Space Duel, Space Invaders.
- Level 6 "AI Systems" set shipped: AI Target Dummy, Pacman Lite, Pacman Full AI.
- AttractModeController unified across games; engine-usage listings normalized to actual imports.
- Full automated suite passing (81/81).

Run Locally
-----------
1) From repo root start a simple server: `python -m http.server 8000`
2) Open `http://localhost:8000/`
3) Launchers: root hub (`index.html`), samples (`samples/index.html`), games (`games/index.html`).

Useful Commands
---------------
- `npm test` - run node-safe automated tests.
- `npm run build:manifest` - regenerate `docs/build/sample-manifest.json` for sample listings.

Conventions
-----------
- Import `Engine` from `engine/core/Engine.js`; prefer subsystem barrels such as `engine/scenes/index.js` and `engine/input/index.js`.
- Keep each page's engine usage list limited to the classes it actually imports.

More Info
---------
Start with `docs/getting-started.md`, `docs/repo-directory-structure.md`, and `engine/README.md` for deeper architecture and standards.
