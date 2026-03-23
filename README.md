Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine Stabilization Phase 1 (Scene Lifecycle + Transition Seams)

## Purpose
Implement the first post-cleanup stabilization pass.

## Goal
Fix scene lifecycle correctness and remove the remaining transition renderer boundary leak.

## Scope
- `engine/core/Engine.js`
- `engine/scenes/Scene.js`
- `engine/scenes/SceneManager.js` only if needed for parity/alignment
- `engine/scenes/TransitionScene.js`
- focused engine/scene tests
- `tests/run-tests.mjs` only if required

## Constraints
- No gameplay changes
- No persistence work in this PR
- No ParticleSystem work in this PR
- No Asteroids extraction work in this PR
- Preserve current scene flow semantics except for lifecycle correctness
- Do not broaden transition responsibilities beyond fixing the seam

## Expected Outcome
- scene transitions consistently call `exit()` on the outgoing scene and `enter()` on the incoming scene
- no double-enter / skipped-exit behavior
- `TransitionScene` no longer depends on raw `renderer.ctx`
- focused tests prove lifecycle and transition behavior
