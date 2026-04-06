Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_NETWORK_PROMOTION.md

# PLAN_PR_DEBUG_SURFACES_NETWORK_PROMOTION

## Purpose
Define a docs-first promotion path for proven network debug capabilities into reusable ownership, while keeping engine core limited to minimal contracts/hooks and preserving sample-owned scenario logic.

## Workflow Discipline
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Scope
This PLAN PR is documentation only. It does not move implementation code.

## Goals
- promote reusable network debug capability into shared ownership under `engine/debug/network`
- keep engine core contract-only for minimal debug hooks/interfaces
- keep sample-specific scenarios, feeds, and local adapters project-owned
- preserve read-only data flow and debug-only access behavior
- preserve console/overlay decoupling from dashboard internals

## Non-Goals
- no engine core implementation changes
- no runtime transport/protocol changes
- no dashboard feature expansion beyond proven debug scope
- no sample scenario promotion into shared layer
- no containerization/deployment changes

## Target Structure (Promotion Direction)
```text
engine/
  core/
    debug/
      NetworkDebugContracts.js
      NetworkDebugRegistrationHooks.js
      NetworkDebugGateHooks.js
  debug/
    network/
      bootstrap/
        createNetworkDebugSurfaceIntegration.js
      providers/
        networkDebugProviderRegistry.js
        networkDebugSnapshotNormalizer.js
      panels/
        networkDebugPanelRegistry.js
        networkDebugPanelRenderer.js
      commands/
        networkDebugCommandPackBridge.js
      dashboard/
        serverDashboardHost.js
        serverDashboardRegistry.js
        serverDashboardProviders.js
        serverDashboardRenderer.js
      diagnostics/
        divergenceDiagnosticsModel.js
        latencyDiagnosticsModel.js
        replicationDiagnosticsModel.js

tools/
  dev/
    server-dashboard/
      (project-owned docs/integration notes and optional local adapters)

games/
  network_sample_*/
    (sample-specific scenarios, synthetic feeds, local adapters remain here)
```

## Ownership Matrix
| Area | Owner | Scope |
|---|---|---|
| Minimal contracts/hooks | `engine/core/debug` | registration hooks, environment gating, narrow interfaces only |
| Reusable network debug implementation | `engine/debug/network` | shared providers/panels/commands/dashboard foundation/diagnostics helpers |
| Sample scenarios and synthetic feeds | project/sample folders | Sample A/B/C deterministic scenarios and local adapters |
| Tool-local helper glue | `tools/dev` + project | temporary adapters, local stubs, project-specific sections |
| Engine core UI behavior | not allowed | core must not own console/overlay/dashboard rendering policy |

## Migration Phases
1. Proven Capability Inventory
Identify stable network debug pieces already validated in sample flow (panels, providers, commands, dashboard foundation).

2. Shared-vs-Local Split
Tag each artifact as shared (`engine/debug/network`) or local (sample/project/tool) with explicit non-promotion exclusions.

3. Contract Freeze
Define minimal core hook contracts required for shared registration/gating. Keep contracts narrow and implementation-free.

4. Shared Layer Assembly
Define extraction map into `engine/debug/network` for providers, panels, command bridge, dashboard foundation, and diagnostics helpers.

5. Sample Rebind Strategy
Define sample-level adapter rewiring to consume shared components while retaining local scenarios/feeds.

6. Promotion Readiness Review
Run validation matrix and risk controls before BUILD/APPLY execution.

## Validation Strategy
### Functional Parity
- Sample A/B/C panels/providers/commands remain behavior-compatible after promotion path definition.

### Boundary Validation
- shared layer consumes public selectors/events only
- no private runtime mutation hooks introduced
- dashboard remains independent from console/overlay internals

### Data Flow Validation
- provider-to-renderer path remains read-only
- dashboard/diagnostics views remain observational only

### Gating Validation
- debug-only access contracts remain explicit
- combo key behavior is unaffected by network promotion design

## Risk Controls
### Risk: over-promoting sample-specific logic
Control: require explicit ownership matrix tagging with non-promote list.

### Risk: core-layer scope creep
Control: permit only minimal contract/hook surface in `engine/core/debug`.

### Risk: coupling dashboard with console/overlay internals
Control: keep dashboard host/registry/providers/renderer isolated in `engine/debug/network/dashboard`.

### Risk: migration regressions across samples
Control: phase-gated validation matrix with sample parity checks before APPLY.

## Rollout Notes
- execute promotion incrementally by subsystem (providers -> panels -> commands -> dashboard -> diagnostics)
- keep one PR per purpose in BUILD/APPLY sequence
- preserve rollback checkpoints by phase
- treat Sample C divergence/trace as proving consumer, not shared implementation source

## Next Command
`BUILD_PR_DEBUG_SURFACES_NETWORK_PROMOTION`
