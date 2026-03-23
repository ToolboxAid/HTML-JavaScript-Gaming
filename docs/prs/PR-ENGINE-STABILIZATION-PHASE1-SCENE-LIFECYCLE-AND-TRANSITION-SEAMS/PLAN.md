Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Engine Stabilization Phase 1: Scene Lifecycle + Transition Seams

## Goal
Make engine scene replacement behavior lifecycle-correct and remove the remaining transition-scene renderer boundary leak while preserving runtime behavior.

## In Scope
- `engine/core/Engine.js`
- `engine/scenes/Scene.js`
- `engine/scenes/SceneManager.js` only if required for parity
- `engine/scenes/TransitionScene.js`
- focused engine/scene tests under `tests/engine/`
- `tests/run-tests.mjs` only if required

## Out of Scope
- persistence/browser-default cleanup
- ParticleSystem determinism
- Asteroids validation expansion
- promotion/extraction work
- gameplay tuning changes
- scene system redesign beyond lifecycle correctness

## Required Changes

### 1. Scene lifecycle correctness
Ensure scene replacement follows the correct contract:
- outgoing scene receives `exit()`
- incoming scene receives `enter()`

Guard against:
- double-enter
- skipped-exit
- scene-state leakage across replacement

Align `Engine` behavior with the intended scene lifecycle contract and existing `SceneManager` expectations.

### 2. Transition renderer seam cleanup
Remove any remaining dependency on raw `renderer.ctx` from `TransitionScene`.

Transition rendering must route through renderer-owned behavior or an existing renderer seam.
Do not introduce a broad new rendering abstraction in this PR.

### 3. Preserve behavior
Preserve:
- current scene flow semantics other than the lifecycle correction
- current transition behavior as perceived by samples/games
- render/update ordering outside the corrected lifecycle path

### 4. Focused tests
Add focused tests that prove:
- outgoing scenes receive `exit()` on replacement
- incoming scenes receive `enter()` exactly once
- no double-enter occurs during scene replacement
- transition rendering no longer requires raw context reach-through
- no regressions in basic scene handoff behavior

## Acceptance Criteria
- `Engine` scene replacement is lifecycle-correct
- `TransitionScene` no longer reaches through `renderer.ctx`
- focused engine/scene tests are present
- no unrelated subsystems are changed
