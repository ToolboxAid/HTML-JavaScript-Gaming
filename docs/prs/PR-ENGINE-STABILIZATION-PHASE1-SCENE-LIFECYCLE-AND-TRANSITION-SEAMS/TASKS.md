Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS — Engine Stabilization Phase 1: Scene Lifecycle + Transition Seams

- [ ] Inspect current scene replacement behavior in `engine/core/Engine.js`
- [ ] Inspect scene lifecycle expectations in `engine/scenes/Scene.js`
- [ ] Inspect `SceneManager` only if needed for lifecycle parity
- [ ] Ensure outgoing scene receives `exit()` during replacement
- [ ] Ensure incoming scene receives `enter()` exactly once
- [ ] Prevent double-enter / skipped-exit behavior
- [ ] Remove raw `renderer.ctx` dependency from `TransitionScene`
- [ ] Keep transition behavior visually/functionally unchanged
- [ ] Add focused engine/scene tests under `tests/engine/`
- [ ] Update test runner only if required
- [ ] Validate no persistence/FX/Asteroids extraction work slipped into this PR
