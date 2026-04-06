Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS.md

# BUILD_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS

## Build Intent
Prepare an implementation-ready BUILD follow-up for advanced inspector capabilities under debug layers only.

## Build Scope
- finalize host/registry/command/view-model contract details
- define bounded inspector data contracts (read-only)
- define adapter seam contracts for project-owned target extraction
- define APPLY slice order and validation gates

## Authoritative Target Structure
```text
engine/debug/inspectors/
  bootstrap/createInspectorSurfaceIntegration.js
  host/debugInspectorHost.js
  registry/debugInspectorRegistry.js
  commands/registerInspectorCommands.js
  viewModels/
    entityInspectorViewModel.js
    componentInspectorViewModel.js
    stateDiffInspectorViewModel.js
    timelineInspectorViewModel.js
    eventStreamInspectorViewModel.js
```

## Guardrails
- no engine core changes
- no hidden 3D assumptions
- no auto-injection into unrelated games/samples
- opt-in wiring only
- read-only inspector data flow only

## Ordered APPLY Steps
1. Add inspector host + registry.
2. Add inspector command bridge via public APIs.
3. Add read-only inspector view-model modules.
4. Add opt-in bootstrap helper.
5. Wire only explicitly chosen sample/tool consumers.
6. Run import/smoke/contract validation.
7. Apply bracket-only roadmap state updates.

## Validation Targets
- import health for inspector modules
- command outputs deterministic and read-only
- bounded history/timeline contracts
- no engine core files touched
- no forced adoption side effects

## Packaging
`<project folder>/tmp/PLAN_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS_delta.zip`
