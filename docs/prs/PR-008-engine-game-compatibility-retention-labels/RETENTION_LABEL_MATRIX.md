PR-008 — verified engine/game retention label matrix

### Basis

This matrix builds on the verified PR-007 classification set and records retention intent only.

### Retention Label Matrix

| Entry File | Verified Default Export | PR-007 Classification | Retention Label | Rationale |
| --- | --- | --- | --- | --- |
| `engine/game/gameCollision.js` | `GameCollision` | `internal` | `compatibility-retained` | collision-oriented plumbing remains exposed for compatibility, but is not the preferred long-term direct public surface |
| `engine/game/gameObject.js` | `GameObject` | `public` | `intended public-facing` | object-level composition is one of the clearest direct game-facing surfaces in the current boundary direction |
| `engine/game/gameObjectManager.js` | `GameObjectManager` | `internal` | `compatibility-retained` | manager orchestration remains available for compatibility, but is not preferred as a future-facing direct API |
| `engine/game/gameObjectRegistry.js` | `GameObjectRegistry` | `internal` | `compatibility-retained` | registry bookkeeping is better treated as preserved plumbing than as intended public-facing API |
| `engine/game/gameObjectSystem.js` | `GameObjectSystem` | `internal` | `compatibility-retained` | system coordination is retained to avoid breakage, but is not the preferred direct boundary |
| `engine/game/gameObjectUtils.js` | `GameObjectUtils` | `transitional` | `compatibility-retained` | broad utility surfaces are preserved for compatibility and should not expand without later review |
| `engine/game/gamePlayerSelectUi.js` | `GamePlayerSelectUi` | `public` | `intended public-facing` | player-selection UI is a reasonable higher-level game-facing surface to keep directly consumable |
| `engine/game/gameUtils.js` | `GameUtils` | `transitional` | `compatibility-retained` | generic utils are preserved to avoid breakage, but are not preferred as long-term public boundary anchors |

### Notes

- `intended public-facing` means the export is acceptable to keep as part of the preferred direct game-facing surface.
- `compatibility-retained` means the export remains exposed to preserve compatibility, but should not be treated as the preferred long-term public boundary.
