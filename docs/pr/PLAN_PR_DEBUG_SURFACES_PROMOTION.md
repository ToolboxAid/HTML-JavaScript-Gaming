# PLAN_PR_DEBUG_SURFACES_PROMOTION

## Objective
Define a docs-first promotion plan that moves proven debug surfaces out of `tools/dev` into shared layers while minimizing engine-core changes and preserving clean boundaries.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
Debug surfaces promotion planning only.

## In Scope
- authoritative ownership boundaries for engine-core, engine-debug, and project/sample/tool layers
- target folder structure for promoted systems
- migration phases and ordered execution intent
- validation strategy, risk controls, rollback/rollout notes
- proving integration reference: `MultiSystemDemoScene.js`

## Out of Scope
- implementation migration in this PR
- feature expansion
- engine-core debug UI ownership
- moving sample-specific panels/providers/commands into shared layers

## Proven Systems Candidate Set
- Dev Console host and command bridge
- Debug Overlay host
- Overlay panel registry
- Overlay provider plumbing
- Overlay operator command integration
- Overlay panel persistence boundary

## Ownership Model
### Engine Core (minimal contract layer)
Own only stable contracts and hooks:
- debug surface interfaces
- registration hooks
- environment/debug gating contract

Must not own:
- console UI behavior
- overlay panel rendering policy
- persistence storage policy
- sample/tool specific debug logic

### Engine Debug (shared implementation layer)
Own reusable debug implementation:
- console runtime host
- overlay runtime host
- panel registry
- provider registry/plumbing
- operator command adapter wiring
- persistence adapter boundary
- debug bootstrap/composition

### Project/Sample/Tool Layers
Remain local:
- sample-specific panels
- sample-specific providers
- sample-specific commands
- scene wiring/defaults/presets
- tool-specific adapters

## Target Structure (Authoritative Direction)
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
      MultiSystemDemoScene.js
```

## Migration Phases
### Phase 1: Ownership Lock
- freeze ownership matrix
- freeze no-go boundaries for sample-owned artifacts

### Phase 2: Contract Extraction
- identify and isolate minimal engine-core debug contracts/hooks
- keep core contract-only

### Phase 3: Engine-Debug Assembly
- relocate reusable debug implementations to `engine/debug`
- preserve current public behavior via adapter/bridge seams

### Phase 4: Sample Rewire
- reconnect `MultiSystemDemoScene.js` through shared debug bootstrap/public registration
- keep sample-owned panels/providers/commands local

### Phase 5: Stabilization
- run parity validation
- confirm no feature expansion and no core policy creep

## Validation Strategy
- contract validation: ownership boundaries remain intact
- behavior validation: console/overlay parity retained
- integration validation: `MultiSystemDemoScene.js` remains proving integration
- safety validation: unknown panel/provider IDs and degraded states fail safely

## Risk Controls
- minimize engine-core scope to contracts/hooks only
- prohibit private console-overlay coupling
- prohibit sample-specific artifact promotion into shared layers
- maintain rollback checkpoints by phase

## Rollout Notes
- this PLAN PR is docs-only
- BUILD PR should define exact extraction map and acceptance checks
- APPLY PR should execute relocation incrementally with sample-first validation
- no unrelated refactors in promotion PRs
