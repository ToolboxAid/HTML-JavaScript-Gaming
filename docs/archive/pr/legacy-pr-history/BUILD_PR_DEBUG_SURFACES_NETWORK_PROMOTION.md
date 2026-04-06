Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_NETWORK_PROMOTION.md

# BUILD_PR_DEBUG_SURFACES_NETWORK_PROMOTION

## Build Summary
Define the implementation shape for promoting reusable network debug capabilities into a shared `engine/debug/network` layer while keeping sample scenarios and adapters project-owned.

## Workflow Discipline
PLAN_PR -> BUILD_PR -> APPLY_PR

## Scope
- create reusable network debug modules under `engine/debug/network`
- keep engine core unchanged in this slice
- keep data flow read-only for providers/panels/dashboard
- preserve sample-level integration for Sample A/B/C

## Target Structure
```text
engine/debug/network/
  index.js
  shared/
    networkDebugUtils.js
  providers/
    networkDebugProviderRegistry.js
  panels/
    networkDebugPanelRegistry.js
  commands/
    networkDebugCommandPackBridge.js
  bootstrap/
    createNetworkDebugSurfaceIntegration.js
  dashboard/
    serverDashboardHost.js
    serverDashboardRegistry.js
    serverDashboardProviders.js
    serverDashboardRenderer.js
  diagnostics/
    divergenceDiagnosticsModel.js
    latencyDiagnosticsModel.js
    replicationDiagnosticsModel.js
```

## Ownership Model
- shared reusable logic: `engine/debug/network`
- sample-specific scenarios and local adapters: `games/network_sample_*`
- engine core: no implementation changes in this promotion slice

## Validation Targets
- network shared modules import successfully
- Sample A/B/C debug plugins continue to expose providers/panels/commands
- provider descriptors remain read-only
- dashboard host/providers/renderer remain observational only

## Apply Gate
APPLY should wire sample plugin creation through shared network bootstrap and export the shared layer from `engine/debug/index.js` without changing combo-key behavior or core runtime contracts.
