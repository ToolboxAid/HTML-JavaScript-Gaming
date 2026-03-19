PR-006 - engine/game repo export scan results

### Scan Scope

- directory: `engine/game`
- entry files scanned: all `.js` files in `engine/game`
- execution date: 2026-03-19

### Scan Method

1. Enumerate `engine/game/*.js` entry files.
2. Capture `export` statements exactly as written.
3. Detect re-export forms (`export { ... } from` and `export * from`).
4. Record defining file, re-export file when applicable, and surface type.

### Re-export Detection Result

No re-export statements were found in the scanned `engine/game` entry files.

### Export Surface Table

| Entry File | Export Name (Exact) | Export Statement (Exact) | Defining File | Re-export File | Surface Type | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `engine/game/gameCollision.js` | `default` | `export default GameCollision;` | `engine/game/gameCollision.js` |  | `direct export` | class symbol: `GameCollision` |
| `engine/game/gameObject.js` | `default` | `export default GameObject;` | `engine/game/gameObject.js` |  | `direct export` | class symbol: `GameObject` |
| `engine/game/gameObjectManager.js` | `default` | `export default GameObjectManager;` | `engine/game/gameObjectManager.js` |  | `direct export` | class symbol: `GameObjectManager` |
| `engine/game/gameObjectRegistry.js` | `default` | `export default GameObjectRegistry;` | `engine/game/gameObjectRegistry.js` |  | `direct export` | class symbol: `GameObjectRegistry` |
| `engine/game/gameObjectSystem.js` | `default` | `export default GameObjectSystem;` | `engine/game/gameObjectSystem.js` |  | `direct export` | class symbol: `GameObjectSystem` |
| `engine/game/gameObjectUtils.js` | `default` | `export default GameObjectUtils;` | `engine/game/gameObjectUtils.js` |  | `direct export` | class symbol: `GameObjectUtils` |
| `engine/game/gamePlayerSelectUi.js` | `default` | `export default GamePlayerSelectUi;` | `engine/game/gamePlayerSelectUi.js` |  | `direct export` | class symbol: `GamePlayerSelectUi` |
| `engine/game/gameUtils.js` | `default` | `export default GameUtils;` | `engine/game/gameUtils.js` |  | `direct export` | class symbol: `GameUtils` |

### Compatibility Note

This record is factual only and does not change runtime behavior, imports,
file locations, or execution paths.
