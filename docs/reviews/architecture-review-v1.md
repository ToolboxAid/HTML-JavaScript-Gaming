# Architecture Review v1

## Status

Active.

## Scope

Repository-wide architecture review with an engine-first approach.

## Goals

- identify public, internal, and private boundaries
- map subsystem ownership
- detect coupling and duplication
- generate small, safe PR candidates

## Initial review order

1. `engine/core`
2. `engine/game`
3. lifecycle and object base classes
4. `engine/animation`
5. `engine/render`
6. `engine/input`
7. `engine/physics`
8. `engine/math`
9. `engine/messages`
10. `engine/output`
11. `engine/utils`
12. `tests`
13. `samples`
14. `games`
15. `tools`
16. docs alignment

## Boundary review standard

For each reviewed area, answer:

- What is public?
- What is internal?
- What is private?
- Who owns state?
- Who owns lifecycle?
- Who depends on it?
- What should it depend on?
- Is it safe to change without breaking consumers?

## Current findings

### Repo-level review state

Pending direct code review.

### Cross-cutting issues

Pending.

## Risk map

### High risk

- runtime orchestration
- object lifecycle ownership
- collision and registry coordination

### Medium risk

- render subsystem
- input subsystem
- animation and physics sequencing

### Lower risk

- isolated utilities
- docs-only changes
- self-contained tools

## Task lanes

### A. Engine inventory

- list all engine folders
- classify boundary level
- identify likely public surface

### B. Core runtime review

- identify entry points
- identify update and render owners
- evaluate runtime context / state ownership

### C. Subsystem review

- responsibility
- dependencies
- coupling
- boundary classification

### D. Consumer review

- compare `samples/` and `games/`
- detect engine API leakage or bypassing

### E. Test alignment

- map tests to public surfaces
- identify hard-to-test architecture

## PR candidate log

Pending.


## Reviewed area: `engine/core`

### Review status

Completed architecture pass from uploaded repository snapshot.

### Findings

#### 1. `engine/core` mixes runtime orchestration with visual/content helpers
`engine/core` currently contains true runtime code (`gameBase.js`, `runtimeContext.js`) alongside canvas, sprite, and tile helpers. This weakens boundary clarity and makes the folder look broader and more public than it should be.

#### 2. `GameBase` is the lifecycle owner, but cleanup relies on subclass field conventions
`GameBase` owns initialization, animation-loop control, visibility handling, and teardown. That is a good runtime center. However, teardown reaches into consumer-owned fields such as keyboard, mouse, and controller members by name, which leaks subclass conventions into the base class.

#### 3. Constructor startup is too eager
`GameBase` performs listener registration, async initialization, and runtime start from the constructor path. Construction and boot are fused, which makes subclassing and testing harder.

#### 4. `RuntimeContext` is narrow today, but built on globally stateful services
`RuntimeContext` is still reasonably focused, which is positive. It proxies rendering, overlays, timers, and teardown concerns. However, its backing services are largely static/global utility classes, so the dependency-injection shape is only partial.

#### 5. Public vs internal vs private boundaries are implied, not explicit
A practical starting split is:
- public: `gameBase.js`
- internal: `runtimeContext.js`
- internal/private: fullscreen, performance, canvas helpers
- misplaced or needs reclassification: sprite/tile/canvas sprite files currently under `engine/core`

### Risks

#### High
- constructor-driven lifecycle
- convention-based cleanup in the base class
- globally stateful services behind an instance-style façade

#### Medium
- `engine/core` scope is too broad
- `RuntimeContext` can drift into a god object if not constrained
- game-loop orchestration can spread into subclasses inconsistently

#### Lower
- browser-global assumptions reduce portability
- folder naming/layout blurs intended public API boundaries

### PR candidates

#### PR-005
- **Title:** refactor: split runtime and visual helpers out of `engine/core`
- **Scope:** `engine/core`, destination folders under `engine/renderers`, `engine/utils`, or a new visual/assets area
- **Risk:** Medium
- **Status:** pending
- **Why:** make `engine/core` mean runtime only

#### PR-006
- **Title:** refactor: introduce explicit runtime start for `GameBase`
- **Scope:** `engine/core/gameBase.js`
- **Risk:** High
- **Status:** pending
- **Why:** separate construction from boot and reduce subclass fragility

#### PR-007
- **Title:** refactor: replace subclass cleanup conventions with registered disposables
- **Scope:** `engine/core/gameBase.js`, input/controller ownership points
- **Risk:** Medium
- **Status:** pending
- **Why:** remove hidden field-name contracts from the base class

#### PR-008
- **Title:** docs: classify `engine/core` public and internal APIs
- **Scope:** `docs/ENGINE_API.md`, `docs/ENGINE_STANDARDS.md`
- **Risk:** Low
- **Status:** pending
- **Why:** stop accidental consumer dependency on internals

#### PR-009
- **Title:** refactor: move runtime services toward instance-backed ownership
- **Scope:** `engine/core/fullscreen.js`, `engine/core/performanceMonitor.js`, `engine/core/runtimeContext.js`
- **Risk:** High
- **Status:** pending
- **Why:** align service lifetime with runtime instances instead of globals

