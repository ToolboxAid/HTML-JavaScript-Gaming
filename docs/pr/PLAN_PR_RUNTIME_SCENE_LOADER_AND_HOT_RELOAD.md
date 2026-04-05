Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD.md

# PLAN PR
## Runtime Scene Loader and Hot Reload

## Objective
Define a docs-only, execution-ready plan for a runtime scene loader and hot reload workflow that sits on top of the newly standardized render pipeline contract and composition model. This PR must preserve the established workflow of PLAN_PR -> BUILD_PR -> APPLY_PR and remain docs-first with no implementation code in the bundle.

## Why This PR Exists
The render pipeline contract across Tile Map Editor, Parallax Editor, Sprite Editor, and Vector Asset Studio establishes a shared data language. The next platform step is a runtime orchestration layer that can:
- load composition-driven scenes through public engine contracts
- detect updated tool output assets during active development
- reload affected runtime resources safely and deterministically
- shorten the authoring loop without bypassing validation or scene ownership rules

## Scope
This plan PR defines:
- runtime scene loader responsibilities
- hot reload goals and non-goals
- public integration points only
- scene composition flow
- reload lifecycle
- validation and failure behavior
- test planning
- build and apply sequencing expectations for Codex

This plan PR does not define implementation code.

## Architecture Fit
The runtime scene loader must respect the current architecture:
- engine owns lifecycle and reusable logic
- samples demonstrate features through public contracts only
- tools remain content producers, not runtime owners
- future games must consume the same loader path as samples

## Proposed Runtime Components
### 1. SceneCompositionLoader
Purpose:
- load a composition document that references tool outputs
- validate top-level composition structure before runtime hydration
- resolve asset references through approved loader paths
- produce a normalized in-memory scene package

Responsibilities:
- parse composition JSON
- validate version, scene id, and referenced assets
- route each asset type to the correct loader
- assemble a runtime-ready scene descriptor
- surface structured errors

Non-responsibilities:
- no tool-specific fallback mutation
- no hidden conversion of malformed payloads
- no direct rendering

### 2. RuntimeSceneLoader
Purpose:
- convert normalized scene packages into live runtime state using public engine contracts

Responsibilities:
- create runtime scene resources in deterministic order
- request tilemap, parallax, sprite, and vector resource loading
- register runtime-owned handles for cleanup and reload
- integrate with scene lifecycle without bypassing scene contracts

Non-responsibilities:
- no direct file watching
- no editor UI ownership
- no sample-specific hacks

### 3. HotReloadCoordinator
Purpose:
- coordinate safe reload cycles after watched assets change

Responsibilities:
- receive change notifications from a watcher bridge
- classify the changed document type
- run validation before replacing runtime resources
- apply reload updates in deterministic stage order
- preserve runtime stability on validation failure
- emit structured reload status for debug visibility

Non-responsibilities:
- no polling policy decisions inside the engine core unless already approved
- no blind replacement of invalid assets
- no mutation of unrelated scene domains

### 4. WatcherBridge
Purpose:
- isolate environment-specific file change detection from runtime orchestration

Responsibilities:
- receive or normalize file change events from the development environment
- report changed paths and event kinds to the hot reload coordinator
- remain optional in production builds

Non-responsibilities:
- no engine logic ownership
- no scene composition logic

## Composition Flow
1. Composition document requested by sample or game scene
2. SceneCompositionLoader validates and resolves references
3. RuntimeSceneLoader hydrates runtime resources in deterministic stage order
4. Active scene stores reload handles
5. WatcherBridge reports changed assets during development
6. HotReloadCoordinator validates changed payloads
7. Valid changes replace only affected runtime domains
8. Invalid changes preserve previous good state and emit structured errors

## Deterministic Stage Order
Hot reload and initial load must use the same runtime ordering:
1. composition metadata
2. parallax background domains
3. tilemap world domains
4. entities and sprite-driven domains
5. vector overlay and debug domains
6. final scene ready signal

Reload sequencing must be domain-aware:
- parallax-only change reloads parallax resources only
- tilemap-only change reloads tilemap resources and dependent collision data only
- vector-only change reloads vector overlay resources only
- composition-level change may require full scene package re-resolution

## Public Engine Mapping
The implementation must lock these mappings:
- composition document -> SceneCompositionLoader
- normalized scene package -> RuntimeSceneLoader
- parallax asset contract -> approved parallax runtime loader/system
- tilemap asset contract -> Tilemap / TilemapRenderSystem / TilemapCollision entry path
- sprite asset contract -> approved sprite/entity render entry path
- vector asset contract -> approved vector runtime entry path
- scene lifecycle integration -> scene init/update/render/dispose contract only

No engine core API breakage is allowed unless explicitly called out in a later approved PR.

## Validation Layer
Validation is mandatory at two levels.

### Composition Validation
Must validate:
- version
- scene id
- referenced asset type
- referenced asset path or resource identifier
- layer/order constraints where required
- duplicate domain collision rules
- unsupported domain declarations

### Asset Validation
Every changed asset must be validated against its locked contract before hydration.

### Failure Rules
- invalid composition -> fail load with structured error
- invalid changed asset during hot reload -> reject reload and keep previous good state
- unsupported version -> fail fast
- missing required referenced asset -> fail load or reject reload based on context
- partial reload must never corrupt unaffected domains

## Hot Reload Modes
### Development Mode
- watcher enabled
- debug events visible
- reload attempts allowed
- validation errors visible but non-destructive to prior good state

### Non-Development Mode
- watcher absent or disabled
- runtime scene loader still supported
- no hot reload side effects

## Safety Rules
- no implicit schema migration during reload
- no silent fallback to malformed content
- no render-order drift between initial load and reload
- no mutation outside the affected runtime domain
- full scene rebuild only when composition-level changes require it
- cleanup of replaced runtime handles is mandatory

## Testing Plan
The future build/apply work should include tests for:
- valid composition load
- unsupported version rejection
- missing asset rejection
- deterministic stage ordering
- parallax-only reload
- tilemap-only reload
- vector-only reload
- composition-triggered full scene refresh
- failed reload preserves previous state
- cleanup of retired runtime handles
- scene dispose cleanup after hot reload usage

## Expected Documentation Deliverables In Next PR
The BUILD_PR for this plan should produce docs-only material covering:
- formal loader contract
- hot reload lifecycle spec
- watcher bridge boundaries
- validation and error taxonomy
- test matrix
- codex execution command
- commit comment
- change summary
- validation checklist
- next command

## Expected Build Constraints For Codex
- keep PR surgical
- use docs/dev for command and commit artifacts
- preserve repo-relative paths
- no implementation code in plan/build bundles
- implementation belongs only in a future apply phase after review

## Acceptance Criteria For This Plan PR
- runtime scene loader scope is clearly separated from tool ownership
- hot reload is defined as an optional development capability
- deterministic render and reload ordering is documented
- validation and failure handling are explicit
- engine mappings are locked to public entry paths only
- build/apply follow-on work is unambiguous for Codex

## Recommended Next Step
Create BUILD_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD as a docs-only, repo-structured delta.
