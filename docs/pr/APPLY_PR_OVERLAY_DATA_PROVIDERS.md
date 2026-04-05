Toolbox Aid
David Quesenberry
04/05/2026
APPLY_PR_OVERLAY_DATA_PROVIDERS.md

# APPLY_PR_OVERLAY_DATA_PROVIDERS

## Objective
Apply the approved overlay data provider contract in a later implementation PR while keeping integration sample-level and boundary-safe.

## Scope
- provider descriptors and snapshot assembly on overlay side
- panel consumption through `ctx.providers`
- sample reference path: `MultiSystemDemoScene.js`

## Guardrails
- no engine core changes
- no direct panel runtime reads
- no provider-to-console coupling
- no overlay host panel special cases

## Apply Checklist
1. Add/read provider descriptors using approved shape.
2. Enforce unique provider IDs.
3. Build snapshot map in overlay update/render flow.
4. Pass providers into panel context.
5. Refactor sample panels to read only from providers.
6. Verify Dev Console stays command/control only.
7. Verify Debug Overlay stays telemetry/visual only.

## Validation Checklist
- provider IDs resolve deterministically
- descriptor validation rejects invalid providers
- snapshot generation handles unavailable providers gracefully
- panels still render with partial provider data
- no direct cross-calls between panel rendering and console internals
- `node --check` passes on touched JS files

## Expected Outcome
Overlay panels consume normalized provider snapshots, runtime read logic is centralized, and console/overlay boundaries remain intact.

## Next Command
`PLAN_PR_OVERLAY_PROVIDER_HEALTH_AND_METRICS`
