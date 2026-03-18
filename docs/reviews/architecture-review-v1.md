# Architecture Review v1

## engine/lifecycle findings

### Findings
1. `engine/lifecycle` currently contains a single class, `ObjectLifecycle`, so the folder boundary is very narrow and clear. That is a strength.

2. `ObjectLifecycle` is a small state-holder for:
   - valid status list
   - current status
   - frame index
   - delay counter
   - destroyed guard

   Architecturally, this is not a full lifecycle system. It is a lifecycle-state helper.

3. The class cleanly separates:
   - status validation
   - status transition
   - counter reset
   - destruction guard

   That makes it predictable and testable.

4. The biggest architecture issue is that the class mixes two concepts:
   - domain lifecycle state (`status`)
   - animation progression state (`currentFrameIndex`, `delayCounter`)

   Those counters are not generic lifecycle concerns. They are animation/timing concerns.

5. The class is neutral about lifecycle semantics:
   - no transition graph
   - no allowed transition rules
   - no callbacks/hooks
   - no ownership contract with object managers or runtime

   This keeps it simple, but it also means lifecycle policy is fragmented elsewhere in the engine.

6. The destroy model is local and defensive:
   - `destroy()` marks the lifecycle helper unusable
   - subsequent operations throw

   That is internally consistent, but it also means `ObjectLifecycle.destroy()` is destruction of the helper, not destruction of the owning object. The naming can blur ownership boundaries.

7. Since the folder only has this one helper, the repo currently does not have a centralized lifecycle architecture in `engine/lifecycle`; instead, lifecycle ownership appears to be distributed across:
   - `engine/core/GameBase`
   - `engine/game/GameObjectManager`
   - object classes and utilities
   - this helper

   So the folder name suggests a subsystem, but the implementation is only a utility primitive.

### Risks
#### High
1. **Lifecycle policy fragmentation**
   The engine does not appear to have one authoritative lifecycle model. `ObjectLifecycle` is only a helper, while real lifecycle ownership is distributed across multiple folders.

2. **Animation state mixed into lifecycle state**
   `currentFrameIndex` and `delayCounter` tie lifecycle to animation sequencing, which makes the abstraction less reusable and muddies subsystem boundaries.

#### Medium
3. **Misleading subsystem boundary**
   A folder named `engine/lifecycle` implies a full lifecycle subsystem, but currently it contains only one low-level helper.

4. **Ownership ambiguity around destroy**
   `ObjectLifecycle.destroy()` destroys the helper object itself, not the engine/game object lifecycle in a broader sense.

5. **No formal transition rules**
   Statuses are validated against an allowed set, but transition legality is not modeled. Any valid status can move to any other valid status.

#### Lower
6. **Future god-helper drift**
   Because this is the only lifecycle file, there is a risk more unrelated lifecycle-ish behavior gets piled into it over time.

### PR Candidates
#### PR-011 — Split animation counters out of `ObjectLifecycle`
- Type: architecture/refactor
- Risk: medium
- Goal: keep `ObjectLifecycle` focused on lifecycle state only
- Move:
  - `currentFrameIndex`
  - `delayCounter`
  into an animation/state-tracking helper or into object-specific animation code

#### PR-012 — Define engine-wide lifecycle ownership model
- Type: architecture
- Risk: high
- Goal: document and normalize who owns:
  - init
  - active/inactive state
  - destruction
  - deregistration
  - animation-state progression

#### PR-013 — Rename or re-scope `engine/lifecycle`
- Type: architecture/docs
- Risk: low
- Goal: either:
  - keep the folder but document it as lifecycle primitives, or
  - expand it into a true lifecycle subsystem

#### PR-014 — Add optional transition rules to `ObjectLifecycle`
- Type: enhancement/architecture
- Risk: medium
- Goal: support explicit allowed transitions such as:
  - alive -> dying
  - dying -> dead
  - but not dead -> alive unless explicitly configured

## PR Roadmap Additions

### PR-011
Title: Split animation counters out of ObjectLifecycle
Scope: engine/lifecycle, engine/animation
Risk: Medium
Status: pending

### PR-012
Title: Define engine-wide lifecycle ownership model
Scope: engine/core, engine/game, engine/lifecycle
Risk: High
Status: pending

### PR-013
Title: Clarify engine/lifecycle boundary
Scope: engine/lifecycle, docs
Risk: Low
Status: pending

### PR-014
Title: Add optional transition rules to ObjectLifecycle
Scope: engine/lifecycle
Risk: Medium
Status: pending
