PR-010 - engine/game verified caller scan results

### Scan Scope

- repository: `ToolboxAid/HTML-JavaScript-Gaming`
- target exports:
  - `GameCollision`
  - `GameObjectManager`
  - `GameObjectRegistry`
  - `GameObjectSystem`
  - `GameObjectUtils`
  - `GameUtils`
- execution date: 2026-03-19

### Scan Method

1. Search repo `.js` files for import paths that target each export-defining module under `engine/game`.
2. Verify caller files from direct import evidence.
3. Classify caller category by top-level path (`games`, `samples`, `engine`, `other`).
4. Record reference type for each verified caller.

### Verified Caller Matrix

| Export Name | Caller File | Caller Category | Reference Type | Factual Note |
| --- | --- | --- | --- | --- |
| `GameCollision` | `engine/game/gameObjectSystem.js` | `engine modules` | `direct import` | imports from `./gameCollision.js` |
| `GameCollision` | `games/Frogger/gameObjects/beaver.js` | `games` | `direct import` | imports from `../../../engine/game/gameCollision.js` |
| `GameCollision` | `games/Frogger/gameObjects/bonus.js` | `games` | `direct import` | imports from `../../../engine/game/gameCollision.js` |
| `GameCollision` | `games/Frogger/gameObjects/snake.js` | `games` | `direct import` | imports from `../../../engine/game/gameCollision.js` |
| `GameCollision` | `games/Pong Game/puck.js` | `games` | `direct import` | imports from `../../engine/game/gameCollision.js` |
| `GameCollision` | `games/Snake/game.js` | `games` | `direct import` | imports from `../../engine/game/gameCollision.js` |
| `GameCollision` | `games/Space Invaders/enemyShip.js` | `games` | `direct import` | imports from `../../engine/game/gameCollision.js` |
| `GameCollision` | `games/Space Invaders/game.js` | `games` | `direct import` | imports from `../../engine/game/gameCollision.js` |
| `GameCollision` | `games/Space Invaders/laser.js` | `games` | `direct import` | imports from `../../engine/game/gameCollision.js` |
| `GameCollision` | `samples/visual/Move Objects/circle.js` | `samples` | `direct import` | imports from `../../../engine/game/gameCollision.js` |
| `GameCollision` | `tests/engine/game/gameCollisionTest.js` | `other repo callers` | `direct import` | imports from `../../../engine/game/gameCollision.js` |
| `GameObjectManager` | `engine/game/gameObjectSystem.js` | `engine modules` | `direct import` | imports from `./gameObjectManager.js` |
| `GameObjectManager` | `tests/engine/game/gameObjectSystemTest.js` | `other repo callers` | `direct import` | imports from `../../../engine/game/gameObjectManager.js` |
| `GameObjectRegistry` | `engine/game/gameObjectSystem.js` | `engine modules` | `direct import` | imports from `./gameObjectRegistry.js` |
| `GameObjectRegistry` | `tests/engine/game/gameObjectSystemTest.js` | `other repo callers` | `direct import` | imports from `../../../engine/game/gameObjectRegistry.js` |
| `GameObjectSystem` | `games/Frogger/attractMode.js` | `games` | `direct import` | imports from `../../engine/game/gameObjectSystem.js` |
| `GameObjectSystem` | `samples/visual/Solar System/solarSystemRuntime.js` | `samples` | `direct import` | imports from `../../../engine/game/gameObjectSystem.js` |
| `GameObjectSystem` | `tests/engine/game/gameCollisionTest.js` | `other repo callers` | `direct import` | imports from `../../../engine/game/gameObjectSystem.js` |
| `GameObjectSystem` | `tests/engine/game/gameObjectSystemTest.js` | `other repo callers` | `direct import` | imports from `../../../engine/game/gameObjectSystem.js` |
| `GameObjectUtils` | `engine/game/gameObject.js` | `engine modules` | `direct import` | imports from `./gameObjectUtils.js` |
| `GameObjectUtils` | `engine/game/gameObjectManager.js` | `engine modules` | `direct import` | imports from `./gameObjectUtils.js` |
| `GameObjectUtils` | `engine/game/gameObjectRegistry.js` | `engine modules` | `direct import` | imports from `./gameObjectUtils.js` |
| `GameObjectUtils` | `engine/game/gameObjectSystem.js` | `engine modules` | `direct import` | imports from `./gameObjectUtils.js` |
| `GameObjectUtils` | `tests/engine/game/gameObjectUtilsTest.js` | `other repo callers` | `direct import` | imports from `../../../engine/game/gameObjectUtils.js` |
| `GameUtils` | `games/Asteroids/runtime/session.js` | `games` | `direct import` | imports from `../../../engine/game/gameUtils.js` |
| `GameUtils` | `games/Asteroids/ui/attractScreen.js` | `games` | `direct import` | imports from `../../../engine/game/gameUtils.js` |
| `GameUtils` | `games/Box Drop/game.js` | `games` | `direct import` | imports from `../../engine/game/gameUtils.js` |
| `GameUtils` | `games/Frogger/game.js` | `games` | `direct import` | imports from `../../engine/game/gameUtils.js` |
| `GameUtils` | `games/Space Invaders/game.js` | `games` | `direct import` | imports from `../../engine/game/gameUtils.js` |
| `GameUtils` | `samples/engine/2D side scroll tile map/sideScrollStateHandlers.js` | `samples` | `direct import` | imports from `../../../engine/game/gameUtils.js` |
| `GameUtils` | `samples/engine/Game Engine/gameStates.js` | `samples` | `direct import` | imports from `../../../engine/game/gameUtils.js` |
| `GameUtils` | `tests/engine/game/gameUtilsTest.js` | `other repo callers` | `direct import` | imports from `../../../engine/game/gameUtils.js` |

### Factual Compatibility Notes

- No explicit compatibility-wrapper import paths were found for these callers.
- Verified references are direct module imports targeting `engine/game/*.js`.
- No explicit compatibility deprecation marker was observed at import lines.

### Summary

- `GameCollision`: 11 verified callers
- `GameObjectManager`: 2 verified callers
- `GameObjectRegistry`: 2 verified callers
- `GameObjectSystem`: 4 verified callers
- `GameObjectUtils`: 5 verified callers
- `GameUtils`: 8 verified callers

### Compatibility Preservation

This capture is factual and docs-only. It does not change runtime behavior, imports,
file locations, or execution paths.
