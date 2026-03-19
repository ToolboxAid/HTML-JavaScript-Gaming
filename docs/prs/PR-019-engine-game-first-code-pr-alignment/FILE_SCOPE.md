PR-019 — file scope

### Smallest Practical File Scope

The first code PR should touch as few files as possible.

Preferred scope:
- only the `engine/game` export-defining files that correspond to documented compatibility-retained exports
- only where comments or runtime-neutral markers can be added without affecting execution

#### Candidate export files
- `engine/game/gameCollision.js`
- `engine/game/gameObjectManager.js`
- `engine/game/gameObjectRegistry.js`
- `engine/game/gameObjectSystem.js`
- `engine/game/gameObjectUtils.js`
- `engine/game/gameUtils.js`

### Scope Rule

Do not expand into callers, import rewrites, unrelated cleanup, or file movement in the first code PR.
