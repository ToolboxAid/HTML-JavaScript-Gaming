# PLAN_PR_DEBUG_SURFACES_PROMOTION

## Objective
Plan a docs-first promotion path for proven debug surfaces from `tools/dev` into shared layers while minimizing engine-core changes.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
Promote proven debug systems with clear ownership boundaries.

## Scope
In scope:
- ownership model for `engine-core`, `engine-debug`, and `project/sample/tool` layers
- target folder structure for promoted debug systems
- phased migration plan
- validation strategy
- risk controls
- rollout notes

Out of scope:
- implementation migration in this PR
- engine-core rewrite
- promotion of sample-specific panels/providers/commands

## Current Proven Surface Set
- Dev Console host
- Debug Overlay host
- Overlay panel registry
- Overlay data providers
- Overlay operator commands
- Overlay panel persistence

## Target Ownership
### Engine Core (minimal contracts only)
Own only stable contracts and gates:
- debug surface interfaces
- registration hooks
- environment/debug gates

Engine core must not own:
- console UI details
- overlay UI policy
- provider implementation details
- persistence policy/storage specifics
- sample-specific debug assets

### Engine Debug (primary promoted implementation)
Own shared reusable debug implementations:
- console runtime host and command bridge
- overlay runtime host
- panel registry
- provider registry/plumbing
- operator command adapters
- persistence adapter boundary and wiring
- debug bootstrap/composition

### Project/Sample/Tool Layers
Remain local and non-promoted:
- sample-specific panels
- sample-specific providers
- sample-specific operator commands
- scene-level wiring and defaults
- tool-specific debug adapters

## Target Folder Structure
```text
engine/
  core/
    debug/
      DebugSurfaceContracts.js
      DebugRegistrationHooks.js
      DebugEnvironmentGate.js
  debug/
    console/
      DevConsoleHost.js
      DevConsoleCommandBridge.js
    overlay/
      DebugOverlayHost.js
      OverlayPanelRegistry.js
      OverlayPersistenceAdapter.js
    providers/
      OverlayProviderRegistry.js
    bootstrap/
      DebugSurfacesBootstrap.js

samples/
  Phase 12 - Demo Games/
    Demo 1205 - Multi-System Demo/
      MultiSystemDemoScene.js   (integration reference)
```

## Migration Phases
### Phase 1: Ownership Lock
- freeze boundary rules and ownership matrix
- confirm sample-owned items remain local

### Phase 2: Contract Extraction
- define minimal core contracts/hooks
- keep core surface narrow and stable

### Phase 3: Engine-Debug Assembly
- move reusable debug implementations into `engine/debug`
- preserve existing public API seams

### Phase 4: Sample Rewire
- keep `MultiSystemDemoScene.js` as proving target
- verify sample-specific panel/provider/command ownership remains local

### Phase 5: Stabilization
- validate behavior parity and rollback readiness
- document promotion-ready state for BUILD/APPLY

## Validation Strategy
- contract validation: boundary and ownership checks pass
- behavior validation: console and overlay continue to operate through public APIs
- regression validation: sample commands, panel visibility, provider snapshots, and persistence remain stable
- safety validation: unknown panel IDs and degraded states fail safely

## Risk Controls
- minimize engine-core changes by promoting implementation to `engine/debug`
- reject direct console-overlay private coupling
- block promotion of sample-specific panels/providers/commands
- preserve phased rollback points at each migration stage

## Rollout Notes
- start with docs-only plan (this PR)
- BUILD PR should define surgical implementation mapping and test/validation execution
- APPLY PR should execute migration incrementally with sample-level validation first
- no broad refactors outside this purpose

## Integration Reference
- `samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/MultiSystemDemoScene.js`

## Next Commands
1. `BUILD_PR_DEBUG_SURFACES_PROMOTION`
2. `APPLY_PR_DEBUG_SURFACES_PROMOTION`
