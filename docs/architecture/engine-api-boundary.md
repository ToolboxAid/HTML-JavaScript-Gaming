Toolbox Aid
David Quesenberry
04/05/2026
engine-api-boundary.md

# Engine API Boundary

## Boundary Rules
- `src/engine/` must not depend on `src/advanced/`.
- Advanced modules in `src/advanced/` must use public engine contracts only.
- Samples, tools, and games must not patch engine internals for project-specific behavior unless explicitly approved in PR scope.

## State Ownership
- Authoritative advanced state belongs in `src/advanced/state/`.
- Foundational reusable state/runtime primitives remain in `src/engine/`.

## Docs and Process Boundary
- Architecture decisions are documented in `docs/architecture/` and `docs/pr/`.
- Active execution controls stay in `docs/dev/`.
- Generated/stale outputs are moved to `docs/archive/` and not kept on active documentation surfaces.

## Section-2 Baseline Public Homes
- Core bootstrapping and frame services: `src/engine/core/index.js`
- Scene runtime management: `src/engine/scene/index.js`
- Rendering layer services: `src/engine/rendering/index.js`
- Input services: `src/engine/input/index.js`
- Physics primitives: `src/engine/physics/index.js`
- Audio services and backends: `src/engine/audio/index.js`
- ECS/runtime systems helpers: `src/engine/systems/index.js`

## Public Contract Baseline
- Domain imports should target each domain `index.js` as the public home.
- Internals remain implementation detail unless explicitly exported by the domain index.
- `src/engine/core/index.js` exposes the combined baseline service cluster for:
  - timing/frame services (`FrameClock`, `FixedTicker`)
  - event routing (`EventBus`)
  - camera integration (`Camera2D`, `followCameraTarget`, `worldRectToScreen`, `updateZoneCamera`)
