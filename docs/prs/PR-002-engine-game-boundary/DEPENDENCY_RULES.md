PR-002 Dependency Rules - engine/game

## Purpose
Define allowed dependency direction for engine/game boundaries while preserving compatibility.

## Boundary Layers
- Layer A: Games and samples (consumers)
- Layer B: Public entry point and public game-facing surfaces
- Layer C: Internal engine/game implementation details
- Layer D: Transitional compatibility surfaces
- Layer E: Runtime internals and low-level subsystem internals

## Allowed Directions
- Layer A -> `engine/core/gameBase.js` (`GameBase`)
- Layer A -> Public `engine/game` modules (`gameObject`, `gameCollision`, `gameObjectSystem`)
- Layer A -> Transitional modules only when already required for compatibility
- Public `engine/game` -> internal `engine/game` helpers as implementation details
- Public/internal/transitional `engine/game` -> stable lower-level subsystem contracts (`engine/objects`, `engine/physics`, `engine/math`, `engine/utils`, selected rendering/core utilities)

## Disallowed Directions
- Layer A -> Internal `engine/game` modules (`gameObjectManager`, `gameObjectRegistry`, `gameObjectUtils`)
- Layer A -> runtime internals (`engine/core/runtimeContext.js`, `engine/core/fullscreen.js`, `engine/core/performanceMonitor.js`) as primary integration path
- Public `engine/game` re-exporting runtime internals as game-facing API
- New modules depending on transitional helpers by default
- Transitional module scope growth beyond compatibility

## Rule Summary
1. `GameBase` is the public runtime entry point.
2. `engine/game` public API should stay narrow and game-facing.
3. Internal helpers stay behind public facades.
4. Transitional helpers remain compatibility bridges, not long-term architecture targets.
5. This PR enforces rules in documentation/review only; no code behavior changes.
