# Architecture Review v1

## engine/game findings

### Findings
1. `engine/game` currently mixes three architectural layers:
   - reusable object-system infrastructure: `gameObjectSystem.js`, `gameObjectManager.js`, `gameObjectRegistry.js`, `gameCollision.js`
   - entity model: `gameObject.js`, `gameObjectUtils.js`
   - game-specific UX/helpers: `gamePlayerSelectUi.js`, `gameUtils.js`

   This weakens the boundary of the folder. The object system looks engine-level and reusable, while the player-select UI and player-count helper logic look consumer/gameplay specific.

2. `GameObjectSystem` is a façade/composition root over:
   - manager
   - registry
   - collision API

   This is a good architectural center, but it exposes child components publicly as mutable properties:
   - `this.manager`
   - `this.registry`
   - `this.collision`

   That means consumers can bypass the intended façade and couple directly to internals.

3. `GameObjectManager` and `GameObjectRegistry` separate responsibilities cleanly:
   - manager owns active collection + lifetime removal
   - registry owns id lookup

   That separation is good. The architecture issue is that destruction semantics are embedded in `GameObjectManager.removeGameObject()`, so “membership removal” and “object lifetime termination” are fused.

4. `GameObjectSystem` rollback behavior is thoughtful:
   - add to manager
   - register
   - rollback manager add on duplicate-id failure

   This is good transactional thinking. But it also shows the system is coordinating two stores that can drift. The need for rollback indicates the manager/registry model is not truly unified.

5. `GameObject` extends `ObjectPNG`, which means the default “game object” abstraction is tightly coupled to PNG-backed rendering. That is a significant architecture choice:
   - all canonical game objects inherit rendering/image assumptions
   - non-sprite domain objects become second-class
   - object identity, motion, and rendering are not cleanly separated

6. `gameCollision.js` is a thin canonical wrapper around physics/boundary utilities. This is good for public API consistency, but it is effectively an alias layer, not a game-domain collision policy layer.

7. `gamePlayerSelectUi.js` and `gameUtils.js` do not fit the same abstraction level as the object system.
   - `gamePlayerSelectUi.js` depends on canvas/core rendering concerns
   - `gameUtils.js` contains player-select defaults, controller button conventions, and life-swapping logic

   These look like gameplay/UI helpers, not engine-level object-system infrastructure.

8. Public/internal/private boundaries are still implicit.
   Likely public:
   - `GameObject`
   - `GameObjectSystem`
   - `GameCollision`

   Likely internal:
   - `GameObjectManager`
   - `GameObjectRegistry`
   - `GameObjectUtils`

   Likely misplaced or should move out of `engine/game`:
   - `GamePlayerSelectUi`
   - `GameUtils`

### Risks
#### High
1. **Rendering-coupled base entity**
   `GameObject` inheriting from `ObjectPNG` makes the engine’s base game-object abstraction image/rendering specific.

2. **Façade bypass risk**
   `GameObjectSystem` publishes `manager`, `registry`, and `collision` directly, allowing consumer code to depend on internal composition.

3. **Folder boundary ambiguity**
   `engine/game` is serving both engine infrastructure and game-specific UI/gameplay helper roles.

#### Medium
4. **Lifetime and membership are fused**
   Removing an object from `GameObjectManager` destroys it. That may be correct for some games, but it limits reuse for pooling, temporary deregistration, scene migration, or ownership transfer.

5. **Dual-store coordination complexity**
   The manager and registry are separate stores that require coordinated rollback paths.

6. **Pseudo-domain collision layer**
   `GameCollision` gives a stable API, but it does not yet encode game-domain policy; it mostly re-exports lower-level utilities.

#### Lower
7. **Utility sprawl**
   `gameObjectUtils.js` mixes constructor validation, metadata init, id validation, and destroy cleanup. It is manageable now but could grow into a grab-bag utility file.

### PR Candidates
#### PR-001 — Split `engine/game` into infrastructure vs gameplay helpers
- Type: architecture
- Risk: medium
- Keep in `engine/game`:
  - `gameObjectSystem.js`
  - `gameObjectManager.js`
  - `gameObjectRegistry.js`
  - `gameCollision.js`
  - `gameObject.js`
  - `gameObjectUtils.js`
- Move out:
  - `gamePlayerSelectUi.js`
  - `gameUtils.js`
- Suggested destinations:
  - `engine/ui/` or `engine/renderers/ui/`
  - or `games/shared/` if they are really gameplay helpers

#### PR-002 — Hide `GameObjectSystem` internals behind a true façade
- Type: architecture/refactor
- Risk: medium
- Replace public mutable properties with private fields or documented internal accessors.
- Keep external API on:
  - `addGameObject`
  - `removeGameObject`
  - `getGameObjectById`
  - `hasGameObjectById`
  - `getActiveGameObjects`
  - collision delegates

#### PR-003 — Decouple base object identity/lifecycle from PNG rendering
- Type: architecture/refactor
- Risk: high
- Introduce a render-agnostic base game entity, then make PNG-backed objects a specialization.

#### PR-004 — Separate membership removal from destruction
- Type: architecture/refactor
- Risk: high
- Add explicit lifecycle methods such as:
  - detach / unregister
  - destroy / dispose
- Keep destruction as a higher-level policy, not always a side effect of removal.

#### PR-005 — Document public/internal/private boundaries for `engine/game`
- Type: docs/architecture
- Risk: low
- Public: `GameObjectSystem`, `GameObject`, `GameCollision`
- Internal: `GameObjectManager`, `GameObjectRegistry`, `GameObjectUtils`
- Reclassify/move: `GamePlayerSelectUi`, `GameUtils`

## PR Roadmap Additions

### PR-007
Title: Split engine/game infrastructure from gameplay helpers
Scope: engine/game
Risk: Medium
Status: pending

### PR-008
Title: Make GameObjectSystem a true façade
Scope: engine/game
Risk: Medium
Status: pending

### PR-009
Title: Decouple GameObject from ObjectPNG
Scope: engine/game, engine/objects, engine/renderers
Risk: High
Status: pending

### PR-010
Title: Separate deregistration from destruction
Scope: engine/game
Risk: High
Status: pending
