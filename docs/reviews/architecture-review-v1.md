# Architecture Review v1

## engine/physics findings

### Findings
1. `engine/physics` is organized as a utility-first subsystem, not an object-oriented service layer. Every module in the folder is effectively a static helper:
   - `PhysicsUtils`
   - `BoundaryUtils`
   - `CollisionUtils`
   - `CollisionShapeUtils`
   - `VectorShapeUtils`
   - `PolygonCollision`

   That makes the boundary easy to understand, but it also means the subsystem has no central public façade.

2. The folder is really serving **three different concerns**:
   - motion/velocity helpers (`physicsUtils.js`)
   - collision and shape helpers (`collisionUtils.js`, `collisionShapeUtils.js`, `polygonCollision.js`, `vectorShapeUtils.js`)
   - screen/bounds logic (`boundaryUtils.js`)

   These concerns are related, but the current folder shape treats them as one flat physics bucket.

3. `PhysicsUtils` is broader than “physics.” It combines:
   - velocity abstraction
   - movement updates
   - directional helpers
   - gravity/wind/drag/friction/bounce
   - future-point prediction
   - stop/set velocity helpers

   This makes it the canonical motion utility, but also creates scope-creep risk. It is as much a kinematics helper as a physics layer.

4. `CollisionUtils` is the architectural center of the collision side, but it is extremely broad. It includes:
   - point transforms
   - AABB-style box collision
   - circle collision
   - vector/polygon collision
   - debug logging and flags
   - rendering-adjacent debug drawing imports through canvas dependencies

   This is a classic “god utility” risk.

5. `CollisionUtils` depends on:
   - `CanvasUtils`
   - `DebugFlag`
   - `DebugLog`
   - `SystemUtils`
   - shape utilities
   - polygon utilities

   That means collision logic is not purely geometric/physics-focused. It is coupled to rendering config and debug infrastructure.

6. `BoundaryUtils` also depends directly on `CanvasUtils.getConfigWidth()` / `getConfigHeight()`. So boundary logic is not generic world-boundary logic; it is specifically **screen/canvas boundary logic**.

7. `CollisionShapeUtils` is a good normalizing helper. It creates a stable way to extract:
   - bounding boxes
   - vector shape data
   from varied object types. This is one of the cleaner abstractions in the folder.

8. `VectorShapeUtils` is also a clean utility layer. Its responsibilities are narrow:
   - validate point arrays
   - rotate points
   - calculate bounds
   - transform vector shapes

   This file has one of the strongest boundaries in the subsystem.

9. `PolygonCollision` is very focused and well-contained. It provides edge intersection and point-in-polygon utilities and does not try to own broader collision orchestration.

10. Public/internal/private boundaries are not explicit, but a sensible classification would be:

   **public**
   - `PhysicsUtils`
   - `CollisionUtils`
   - `BoundaryUtils`

   **internal**
   - `CollisionShapeUtils`
   - `VectorShapeUtils`
   - `PolygonCollision`

   The public issue is that `CollisionUtils` and `BoundaryUtils` expose engine behavior that is actually canvas/screen-dependent, not truly generic physics.

### Risks
#### High
1. **`CollisionUtils` god-utility risk**
   It combines collision math, object-shape interpretation, debug behavior, and canvas-aware assumptions in one large static utility.

2. **Subsystem boundary blur between physics and rendering/runtime**
   `CollisionUtils` and `BoundaryUtils` both depend on `CanvasUtils`, so this subsystem is partly geometry and partly screen/runtime behavior.

3. **No central physics façade**
   Consumers likely import many utility modules directly, which makes future refactors harder and public/internal boundaries weaker.

#### Medium
4. **Flat folder with mixed concerns**
   Motion, collision, shape extraction, and screen boundaries all live together without sub-boundaries.

5. **`PhysicsUtils` scope creep**
   It contains both low-level velocity abstraction and higher-level motion helpers, which may grow into a catch-all movement utility.

6. **Debug coupling inside collision layer**
   Collision code directly owns debug flag/log behavior instead of routing that through a separate debug layer.

#### Lower
7. **Canvas-specific semantics hidden behind generic names**
   `BoundaryUtils` sounds generic, but most of its behavior is specifically about game screen/canvas boundaries.

### PR Candidates
#### PR-025 — Split `engine/physics` into motion, collision, and boundaries sub-boundaries
- Type: architecture
- Risk: medium
- Goal: separate:
  - motion/kinematics
  - collision/shape math
  - screen/world boundary policies

#### PR-026 — Break `CollisionUtils` into smaller focused modules
- Type: architecture/refactor
- Risk: high
- Goal: split:
  - collision math
  - collision shape normalization
  - debug helpers
  - screen-aware checks
- Keep `CollisionUtils` only as a stable façade if needed

#### PR-027 — Rename or document `BoundaryUtils` as screen-boundary logic
- Type: architecture/docs/refactor
- Risk: low
- Goal: make it clear this is canvas/game-area boundary behavior, not generic world-boundary math

#### PR-028 — Remove debug ownership from collision core
- Type: architecture/refactor
- Risk: medium
- Goal: move debug flag/logging concerns out of collision core and into optional debug wrappers

#### PR-029 — Define a public physics API surface
- Type: architecture/docs
- Risk: low
- Goal: document which utilities are public engine APIs and which are internal geometry helpers

## PR Roadmap Additions

### PR-025
Title: Split physics subsystem into motion, collision, and boundary layers
Scope: engine/physics
Risk: Medium
Status: pending

### PR-026
Title: Break CollisionUtils into focused modules
Scope: engine/physics
Risk: High
Status: pending

### PR-027
Title: Clarify BoundaryUtils as screen-boundary logic
Scope: engine/physics
Risk: Low
Status: pending

### PR-028
Title: Remove debug concerns from collision core
Scope: engine/physics
Risk: Medium
Status: pending

### PR-029
Title: Define public and internal physics API boundaries
Scope: engine/physics, docs
Risk: Low
Status: pending
