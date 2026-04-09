# Engine

Shared framework used by `samples/` and `games/`. All modules are ES modules and browser-ready; no build step is required.

## Import Policy
- Bootstrap via `src/engine/core/Engine.js`.
- For subsystems, prefer the public barrel `src/engine/<subsystem>/index.js` when it exists.

## Key Areas
- `core/` timing, orchestration, metrics
- `scenes/` scene lifecycle and transitions
- `render/` canvas renderers and helpers
- `input/` keyboard, mouse, gamepad, action mapping
- `audio/` audio services and backends
- `ui/` shared hub and overlay components
- `world/`, `ecs/`, `collision/`, `vector/`, `utils/` shared math and world helpers
- `persistence/` serialization and storage
- `fx/` effects such as `ParticleSystem`
- platform and pipelines: `runtime/`, `automation/`, `release/`, `security/`, `pipeline/`, `editor/`

## Validation
- Automated: `npm test` (81/81 passing as of 03/25/2026)
- In-repo usage: numbered samples and shipped games (Asteroids, Space Duel, Space Invaders, Pacman Lite/Full AI, AI Target Dummy)
