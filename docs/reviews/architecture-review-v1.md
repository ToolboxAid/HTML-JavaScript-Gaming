# Architecture Review v1

## engine/animation findings

### Findings
1. `engine/animation` has a relatively tight folder boundary. The main modules are:
   - `AnimationFrameStepper`
   - `AnimationStateBridge`
   - `PngController`
   - `SpriteController`
   - `StateUtils`

   That is one of the more coherent engine folders reviewed so far.

2. The subsystem is built around a strong shared primitive: `AnimationFrameStepper`.
   It centralizes:
   - frame index normalization
   - looping frame progression
   - final-frame progression

   Architecturally, this is a good core abstraction and prevents controller logic duplication.

3. `PngController` is a stateful animation controller with clear responsibility:
   - own current frame state
   - own delay counter
   - calculate source rects
   - step looping/final-frame animation

   Its boundary is understandable and focused.

4. `SpriteController` is less of a true controller and more of a frame-set plus stepping helper:
   - it stores frame arrays and delays
   - but it does not own current frame state
   - instead it delegates state progression to callers

   This creates a mismatch with `PngController`, which *does* own animation state.

5. That mismatch is the biggest architecture issue in this folder:
   - `PngController` = stateful controller
   - `SpriteController` = mostly stateless frame-definition helper

   The names imply parallel abstractions, but the actual responsibilities are different.

6. `AnimationStateBridge` exists to mirror `currentFrameIndex` and `delayCounter` between:
   - `target.animation`
   - `target.lifecycle`

   This is a useful compatibility tool, but architecturally it is also a signal that animation state and lifecycle state are split across two owners and need synchronization glue.

7. `StateUtils.syncToObject()` and `AnimationStateBridge.installMirroredCounters()` overlap conceptually:
   - both are solving animation-state synchronization
   - one copies values
   - one installs mirrored accessors

   That suggests animation state ownership is not yet fully normalized.

8. `StateUtils.destroyAnimation()` is not purely animation-state logic. It mixes:
   - calling `animation.destroy()`
   - destroying/nulling properties on the owner object

   That makes it more of an object cleanup helper than an animation helper.

9. Public/internal/private boundaries are still implicit.

   Best current classification:
   - public:
     - `PngController`
     - `SpriteController`
     - `AnimationFrameStepper`
   - internal:
     - `AnimationStateBridge`
     - `StateUtils`

   The likely public API issue is that `SpriteController` and `PngController` present inconsistent controller models under similar names.

### Risks
#### High
1. **Controller model inconsistency**
   `PngController` is stateful, while `SpriteController` is mostly stateless. This makes the animation API harder to reason about and harder to standardize.

2. **Animation state ownership split**
   The existence of `AnimationStateBridge` indicates animation counters are living in more than one subsystem and require synchronization glue.

#### Medium
3. **Bridge/utility overlap**
   `AnimationStateBridge` and `StateUtils` both participate in state mirroring/sync, which increases duplication of concepts.

4. **Cleanup logic inside animation utilities**
   `StateUtils.destroyAnimation()` mixes animation concerns with property cleanup and owner-object destruction conventions.

5. **Folder naming vs abstraction naming**
   The subsystem is coherent, but the word “Controller” means different things in `PngController` and `SpriteController`.

#### Lower
6. **Potential public API ambiguity**
   Consumers may treat all modules as peer-level public APIs because internal boundaries are not documented.

### PR Candidates
#### PR-036 — Normalize animation controller model
- Type: architecture/refactor
- Risk: high
- Goal: make `PngController` and `SpriteController` follow the same design model:
  - both stateful controllers
  - or both definition/stepping helpers with external state ownership

#### PR-037 — Define animation state ownership
- Type: architecture
- Risk: high
- Goal: choose one authoritative owner for:
  - `currentFrameIndex`
  - `delayCounter`
- Reduce the need for synchronization glue between animation and lifecycle

#### PR-038 — Merge or clearly separate state sync helpers
- Type: architecture/refactor
- Risk: medium
- Goal: either:
  - merge `AnimationStateBridge` and `StateUtils` state-sync responsibilities
  - or document one as compatibility-only and one as internal utility

#### PR-039 — Move cleanup behavior out of `StateUtils`
- Type: architecture/refactor
- Risk: medium
- Goal: keep animation utilities focused on animation concerns only
- Move owner cleanup/property destruction to object/runtime cleanup layers

#### PR-040 — Document public/internal animation API boundaries
- Type: architecture/docs
- Risk: low
- Goal: clarify which modules are stable public APIs and which are internal bridging utilities

## PR Roadmap Additions

### PR-036
Title: Normalize animation controller model
Scope: engine/animation
Risk: High
Status: pending

### PR-037
Title: Define animation state ownership
Scope: engine/animation, engine/lifecycle
Risk: High
Status: pending

### PR-038
Title: Clarify and reduce animation state sync helpers
Scope: engine/animation
Risk: Medium
Status: pending

### PR-039
Title: Move cleanup behavior out of StateUtils
Scope: engine/animation, engine/utils
Risk: Medium
Status: pending

### PR-040
Title: Define public and internal animation API boundaries
Scope: engine/animation, docs
Risk: Low
Status: pending
