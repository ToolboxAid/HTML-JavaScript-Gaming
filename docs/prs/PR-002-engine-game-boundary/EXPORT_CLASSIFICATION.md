PR-002 Export Classification - engine/game

## Purpose
Classify current engine/game surfaces as public, internal, or transitional without changing runtime behavior.

## Entry Point Policy
- Public runtime entry point for games/samples: `engine/core/gameBase.js` (`GameBase`).
- `engine/game` is a supporting game-facing layer, not the runtime bootstrap owner.

## Classification Table
| Surface | Class | Rationale | Caller Guidance |
| --- | --- | --- | --- |
| `engine/core/gameBase.js` (`GameBase`) | Public | Canonical runtime entry used across games/samples. | Prefer this for game startup/lifecycle ownership. |
| `engine/game/gameObject.js` (`GameObject`) | Public | Reusable game-facing object facade consumed by games. | Safe for game code where shared object facade is needed. |
| `engine/game/gameCollision.js` (`GameCollision`) | Public | Canonical game-facing collision facade consumed by games/samples. | Safe for collision and bounds checks at game layer. |
| `engine/game/gameObjectSystem.js` (`GameObjectSystem`) | Public | Public object-system facade used by current callers. | Safe when callers need object lifecycle + registry integration. |
| `engine/game/gameObjectManager.js` (`GameObjectManager`) | Internal | Low-level collection/destroy implementation detail for system internals. | Do not import from games/samples. Use `GameObjectSystem`. |
| `engine/game/gameObjectRegistry.js` (`GameObjectRegistry`) | Internal | Registry bookkeeping detail backing `GameObjectSystem`. | Do not import from games/samples. Use `GameObjectSystem` accessors. |
| `engine/game/gameObjectUtils.js` (`GameObjectUtils`) | Internal | Validation/metadata helper for engine internals. | Do not import from games/samples. |
| `engine/game/gameUtils.js` (`GameUtils`) | Transitional | Shared gameplay helper surface used by existing callers but mixes game-specific flow concerns in `engine/`. | Keep for compatibility; do not expand API or add new dependencies on it. |
| `engine/game/gamePlayerSelectUi.js` (`GamePlayerSelectUi`) | Transitional | Shared UI helper used by existing callers; placement is compatibility-driven and likely movable. | Keep for compatibility; avoid new coupling to this module. |

## Notes
- Transitional does not mean removed in this PR; it means compatibility-only and scope-frozen.
- Internal surfaces may still be technically importable by path; boundary policy treats them as non-public.
- This document is classification-only and intentionally introduces no code changes.
