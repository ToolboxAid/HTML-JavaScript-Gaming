Toolbox Aid
David Quesenberry
04/05/2026
APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD.md

# APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD

## Purpose
Apply the approved runtime scene loader and hot reload design as a focused implementation PR that wires composition-driven scene loading into the existing engine without breaking engine-layer boundaries.

## Scope
Implement only the approved runtime scene loader + hot reload flow.

In scope:
- Add a runtime scene loader above engine systems
- Add hot reload coordinator for development workflows
- Consume the previously defined composition contract and per-tool asset contracts
- Preserve deterministic render ordering already approved in the render pipeline contract work
- Add validation-aware reload behavior
- Add focused automated test coverage
- Add minimal sample/dev wiring needed to verify the pipeline

Out of scope:
- No engine rewrite
- No new editor features
- No new asset schema invention beyond approved contract docs
- No production packaging system
- No multiplayer/network sync
- No destructive public API changes unless required and documented

## Implementation Intent
Codex should implement a thin orchestration layer that:
1. Reads a composition document
2. Validates referenced tool outputs
3. Loads/parses tool outputs into runtime-ready models
4. Applies deterministic stage ordering
5. Swaps the active scene safely in dev workflows on reload
6. Surfaces structured validation/runtime errors without silent failure

## Required Deliverables
### Runtime loading
- Runtime scene loader module
- Composition resolver
- Contract validation bridge
- Tool asset loader adapters only where needed by the approved contracts
- Deterministic stage assembly

### Hot reload
- Development-only hot reload coordinator
- Safe disposal + replacement flow
- Reload debouncing/coalescing if file-watch events can burst
- Reload failure fallback that preserves last known good scene

### Tests
- Composition load success path
- Missing asset / invalid contract rejection
- Render order preservation after reload
- Scene disposal occurs before replacement
- Last-known-good fallback behavior
- No duplicate runtime entities/systems after repeated reloads

## Architecture Constraints
- Loader/orchestrator stays above engine core
- Engine remains reusable and tool-agnostic
- Samples consume public runtime contracts only
- Games are not introduced as a dependency
- Tool-specific quirks are not embedded into engine systems
- Existing engine APIs remain stable unless absolutely necessary and documented

## Suggested File Targets
These are guidance targets. Codex may adjust exact paths if the repo requires better placement while keeping architecture boundaries intact.

- engine/scene/RuntimeSceneLoader.js
- engine/scene/SceneCompositionResolver.js
- engine/validation/RuntimeContractValidator.js
- engine/debug/HotReloadCoordinator.js
- samples/<target-sample>/ or tools/dev harness wiring as appropriate
- tests/scene/RuntimeSceneLoader.test.mjs
- tests/debug/HotReloadCoordinator.test.mjs

## Safe Reload Rules
- Validate before swap
- Build next runtime state before tearing down current scene when possible
- Dispose current scene exactly once before replacement
- Preserve last known good scene if reload fails
- Log structured error output for invalid composition or invalid referenced assets
- Do not leak timers, handlers, subscriptions, or duplicate entities across reload cycles

## Render Ordering
Preserve previously approved stage order:

1. Parallax background
2. Tilemap world
3. Runtime entities / gameplay visuals
4. Sprite effects / foreground sprite layers as approved by contract
5. Vector overlays / debug / UI overlays

If the implementation needs internal sub-stages, document them in code comments/tests while preserving public ordering.

## Acceptance Criteria
- A composition document can load a mixed scene from approved tool outputs
- Hot reload refreshes changed assets/scenes without full restart in dev workflow
- Invalid changes do not crash the running last-known-good scene
- Render order remains deterministic before and after reload
- Repeated reloads do not duplicate objects or corrupt state
- Tests pass
- A repo-structured implementation ZIP is produced at:
  - <project folder>/tmp/APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD_delta.zip

## Validation Checklist
- [ ] Runtime scene loader created
- [ ] Composition-driven scene assembly works
- [ ] Validation blocks malformed inputs
- [ ] Safe dispose/replace behavior confirmed
- [ ] Last-known-good fallback confirmed
- [ ] Deterministic render ordering confirmed
- [ ] Tests added and passing
- [ ] No engine-layer pollution from tool-specific logic
