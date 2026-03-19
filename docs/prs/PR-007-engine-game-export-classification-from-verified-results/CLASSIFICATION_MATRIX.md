PR-007 — verified engine/game export classification matrix

### Basis

This matrix is derived from the verified PR-006 export scan results.

Classification is an architecture recommendation grounded in:
- the verified export list
- file and symbol naming
- the current direction toward a narrower `GameBase`-centered public boundary

### Classification Matrix

| Entry File | Verified Default Export | Classification | Rationale |
| --- | --- | --- | --- |
| `engine/game/gameCollision.js` | `GameCollision` | `internal` | collision behavior is usually engine/runtime plumbing and is better kept behind higher-level game-facing entry points |
| `engine/game/gameObject.js` | `GameObject` | `public` | object-level game composition is a plausible game-facing surface and aligns better with explicit game construction than manager/registry plumbing |
| `engine/game/gameObjectManager.js` | `GameObjectManager` | `internal` | manager surfaces are usually orchestration detail rather than preferred public API in a GameBase-centered model |
| `engine/game/gameObjectRegistry.js` | `GameObjectRegistry` | `internal` | registry surfaces typically expose bookkeeping and lifecycle plumbing that should remain behind the public boundary |
| `engine/game/gameObjectSystem.js` | `GameObjectSystem` | `internal` | system-level coordination reads as engine orchestration infrastructure, not stable game-facing API |
| `engine/game/gameObjectUtils.js` | `GameObjectUtils` | `transitional` | broad utility surfaces often become compatibility carry-overs during boundary tightening and should not grow without stronger public API intent |
| `engine/game/gamePlayerSelectUi.js` | `GamePlayerSelectUi` | `public` | a player-selection UI surface can reasonably be consumed directly by game code as a higher-level feature surface |
| `engine/game/gameUtils.js` | `GameUtils` | `transitional` | generic utils naming suggests a catch-all surface that is often retained temporarily for compatibility while boundaries are narrowed |

### Notes

- `public` here means suitable to remain directly game-facing under current architecture direction.
- `internal` means the export should remain compatibility-preserved for now but is not preferred as stable public API direction.
- `transitional` means the export is currently exposed, preserved for compatibility, and should be reviewed before being treated as stable public API.
