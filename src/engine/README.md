# Engine

Shared framework used by `samples/` and `games/`. All modules are ES modules and browser-ready; no build step is required.

## Import Policy
- Bootstrap via `src/engine/core/index.js` (or `src/engine/core/Engine.js` for legacy direct imports).
- For subsystems, prefer the public barrel `src/engine/<subsystem>/index.js` when it exists.

## Key Areas
- `core/` timing, orchestration, metrics
- `scene/` scene lifecycle and transitions
- `rendering/` canvas renderers and helpers
- `input/` keyboard, mouse, gamepad, action mapping
- `audio/` audio services and backends
- `physics/` reusable physics primitives and helpers
- `systems/` reusable runtime system helpers
- `events/` event routing primitives
- `camera/` camera and world-to-screen integration
- `ui/` shared hub and overlay components
- `world/`, `ecs/`, `collision/`, `utils/` shared math and world helpers
- `persistence/` serialization and storage
- `fx/` effects such as `ParticleSystem`
- platform and pipelines: `runtime/`, `automation/`, `release/`, `security/`, `pipeline/`, `editor/`

## Validation
- Automated: `npm test` (81/81 passing as of 03/25/2026)
- In-repo usage: numbered samples and shipped games (Asteroids, Space Duel, Space Invaders, Pacman Lite/Full AI, AI Target Dummy)
