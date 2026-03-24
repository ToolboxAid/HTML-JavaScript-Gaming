# Engine

The `engine/` folder is the shared framework layer used by `samples/` and `games/`.

## Import Policy
- `engine/core/Engine.js` is the approved direct import for bootstrapping
- for other engine subsystems, prefer the public barrel at `engine/<subsystem>/index.js` when it exists

## Key Areas
- `core/` engine orchestration, timing composition, metrics
- `scenes/` scene lifecycle and transition helpers
- `render/` renderer implementations and render helpers
- `input/` keyboard, mouse, gamepad, action mapping, and reusable gamepad adapters
- `audio/` audio services and backends
- `persistence/` storage and serialization helpers
- `fx/` effect helpers such as `ParticleSystem`
- `runtime/` runtime/platform adapters such as fullscreen/mobile helpers
- `vector/`, `collision/`, `utils/` shared math and geometry helpers
- feature barrels such as `world/`, `automation/`, `editor/`, `release/`, `security/`, `pipeline/`, and others used by later samples

## Validation
Engine behavior is primarily validated through:
- `tests/`
- sample usage under `samples/`
- Asteroids under `games/Asteroids/`

Run the suite from repo root:

```bash
npm test
```
