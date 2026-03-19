PR-020 — file-level patch matrix

### Basis

This matrix defines the exact intended runtime-neutral patch contents for the first `engine/game` code PR.

### File-Level Patch Matrix

| File | Intended Patch Type | Comment / Marker Purpose | Review Note | Success Note |
| --- | --- | --- | --- | --- |
| `engine/game/gameCollision.js` | leading export-intent comment | mark `GameCollision` as a supported compatibility surface and clarify that compatibility support remains current | verify only comment insertion occurs, with no logic edits | code intent is clearer and runtime is unchanged |
| `engine/game/gameObjectManager.js` | leading export-intent comment | mark `GameObjectManager` as compatibility-retained with transition-planning posture in docs only | verify wording does not imply removal or deprecation | callers remain unaffected and posture is clearer |
| `engine/game/gameObjectRegistry.js` | leading export-intent comment | mark `GameObjectRegistry` as compatibility-retained with conservative docs posture | verify no renames, no import changes, no logic edits | compatibility posture is visible without behavior change |
| `engine/game/gameObjectSystem.js` | leading export-intent comment | mark `GameObjectSystem` as a supported compatibility surface and note current caller support | verify insertion is comment-only | documented support is reflected in code comments only |
| `engine/game/gameObjectUtils.js` | leading export-intent comment | mark `GameObjectUtils` as compatibility-retained with transition-planning-note posture | verify no deprecation-style language is introduced | support remains clear and non-alarming |
| `engine/game/gameUtils.js` | leading export-intent comment | mark `GameUtils` as a supported compatibility surface and note current compatibility-facing role | verify comment is runtime-neutral | preferred documentation intent is visible without affecting execution |

### Scope Rule

No additional files should be touched in the first code PR unless they are required to place these comments and still remain runtime-neutral.
