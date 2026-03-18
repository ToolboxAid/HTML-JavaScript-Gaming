# Architecture Review Summary v1

## Review State

The repo currently shows two simultaneous architectural stories:

1. **Modern engine-shell direction**
   - `GameBase`-centered runtime ownership
   - stronger per-domain folders (`engine/input`, `engine/animation`)
   - newer consumer structure in `samples/engine/Game Engine` and `games/Asteroids`
   - runtime/state/ui/system layering is emerging as the clearest target pattern

2. **Legacy direct-integration direction**
   - deep imports into `engine/core`, `engine/game`, `engine/renderers`, and `engine/utils`
   - folder boundaries that are still broad or mixed
   - static/global services hidden behind instance-like wrappers
   - consumer code frequently relying on internal modules

The repo is not architecturally chaotic, but it is **transitional**. It has a strong modern direction, but older patterns remain active and supported.

## Subsystem Summary

### Stronger subsystem boundaries
- `engine/input`
  - strong primitives: `InputFrameState`, `InputLifecycle`
  - main issue: controller façade bypass and constructor auto-start
- `engine/animation`
  - strong primitive: `AnimationFrameStepper`
  - main issue: state ownership split and controller model inconsistency
- `engine/lifecycle`
  - narrow, predictable helper
  - main issue: too small to be a true subsystem; lifecycle policy lives elsewhere

### Mixed or weak subsystem boundaries
- `engine/core`
  - real runtime center exists (`GameBase`, `RuntimeContext`)
  - mixed with sprite/tile/canvas helper concerns
  - constructor-driven startup and global/static service backing are the biggest issues
- `engine/game`
  - good object-system center
  - mixed with gameplay/UI helpers
  - façade bypass and rendering-coupled `GameObject` are major issues
- `engine/renderers`
  - coherent renderer center
  - split across `engine/core`, plus mixed-in assets/effects/planning artifacts
- `engine/physics`
  - useful utility-first subsystem
  - broad collision utility and canvas-coupled boundaries weaken clarity
- `engine/utils`
  - biggest catch-all bucket
  - contains runtime services, debug helpers, asset cache, validation, cleanup, and behavior objects

### Consumer findings
- `samples/`
  - strongest structure at folder level
  - still teaches two patterns: canonical engine shell vs manual demos
- `games/`
  - validates both modern shell architecture and legacy direct integration
  - `games/Asteroids` is the strongest current target pattern

## Global Architecture Risks

### High
1. **Two major architecture patterns remain active**
   - modern shell pattern
   - legacy direct-integration pattern

2. **Public/internal/private boundaries are mostly implicit**
   Many folders still act as mixed-access buckets.

3. **Constructor-driven lifecycle is common**
   Seen in `GameBase` and input adapters.

4. **Façade bypass appears in multiple subsystems**
   Seen in `GameObjectSystem` and `GameControllers`.

5. **Misplaced modules weaken boundary trust**
   Examples:
   - `engine/game/gameUtils.js`
   - `engine/game/gamePlayerSelectUi.js`
   - `engine/utils/canExplode.js`
   - `engine/renderers/particleExplosion.js`

### Medium
6. **Static/global services remain hidden behind instance-style APIs**
   Especially in runtime/core and rendering/canvas support.

7. **State ownership is fragmented**
   Especially for:
   - lifecycle
   - animation state
   - object deregistration vs destruction

8. **Catch-all folders still exist**
   Especially `engine/utils`, and to a lesser degree `engine/core` and `engine/renderers`.

9. **Consumers import internals freely**
   Refactors will stay expensive until boundaries are formalized.

## Roadmap

### Phase 1 — Boundary Clarification (low-risk, highest leverage)
- PR-001: Clarify core boundaries
- PR-006: Define `engine/core` public API
- PR-013: Clarify `engine/lifecycle` boundary
- PR-022: Define public/internal input API boundaries
- PR-029: Define public/internal physics API boundaries
- PR-040: Define public/internal animation API boundaries
- PR-041: Classify samples by architectural role
- PR-046: Classify games by architecture maturity
- PR-048: Define allowed engine imports for games

### Phase 2 — Folder Cleanup / Misplaced Module Extraction
- PR-007: Split `engine/game` infrastructure from gameplay helpers
- PR-016: Move `ParticleExplosion` out of `engine/renderers`
- PR-017: Split render assets from renderer implementations
- PR-019: Remove planning artifacts from runtime tree
- PR-030: Split `engine/utils` into focused subsystem boundaries
- PR-031: Move `CanExplode` out of utils
- PR-032: Move `Timer` into runtime/core boundary
- PR-034: Move `ImageAssetCache` into asset/resource subsystem
- PR-035: Create explicit debug diagnostics boundary
- PR-049: Extract shared gameplay helpers out of engine folders

### Phase 3 — Runtime and API Discipline
- PR-002: Introduce explicit runtime lifecycle start
- PR-003: Replace destroy-field conventions with registered services
- PR-008: Make `GameObjectSystem` a true façade
- PR-020: Make input adapters explicitly startable
- PR-021: Make `GameControllers` a true façade
- PR-027: Clarify `BoundaryUtils` as screen-boundary logic

### Phase 4 — State Ownership / Model Normalization
- PR-011: Split animation counters out of `ObjectLifecycle`
- PR-012: Define engine-wide lifecycle ownership model
- PR-014: Add optional transition rules to `ObjectLifecycle`
- PR-036: Normalize animation controller model
- PR-037: Define animation state ownership
- PR-038: Clarify and reduce animation state sync helpers
- PR-039: Move cleanup behavior out of `StateUtils`

### Phase 5 — Deep Structural Refactors
- PR-005: Convert static runtime services to instance-backed services
- PR-009: Decouple `GameObject` from `ObjectPNG`
- PR-010: Separate deregistration from destruction
- PR-015: Clarify render subsystem boundaries
- PR-018: Separate `PrimitiveRenderer` debug helpers from draw backend
- PR-025: Split physics subsystem into motion, collision, and boundary layers
- PR-026: Break `CollisionUtils` into focused modules
- PR-028: Remove debug concerns from collision core
- PR-033: Break up or constrain `SystemUtils`
- PR-042: Normalize input samples around a shared shell pattern
- PR-044: Promote `samples/engine/Game Engine` as canonical starter template
- PR-047: Promote `games/Asteroids` as canonical game architecture reference
- PR-050: Create migration plan for legacy games

## Recommended Next Execution Focus

Best next practical move:
- convert this review into a prioritized PR board
- start Phase 1 with small boundary/documentation PRs
- then open the first real code PR around `engine/core` and `engine/game`

Recommended first implementation PR:
- **PR-001 / PR-006 combined planning pass**
  - define `engine/core` boundary
  - identify public vs internal modules
  - document approved game/sample entry points
