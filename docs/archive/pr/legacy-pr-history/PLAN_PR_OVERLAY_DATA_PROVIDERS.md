Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_OVERLAY_DATA_PROVIDERS.md

# PLAN_PR_OVERLAY_DATA_PROVIDERS

## Goal
Define a clean, read-only provider layer for Debug Overlay panels so panels consume provider snapshots instead of reading runtime state directly.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Single PR Purpose
Overlay data providers only.

## In Scope
- provider IDs and naming guidance
- provider descriptor contract
- provider snapshot collection model
- panel consumption boundary (`ctx.providers[...]`)
- validation goals and sample-level integration reference

## Out of Scope
- engine core changes
- Dev Console command expansion
- overlay layout redesign
- panel persistence/presets

## Boundary Preservation
- Dev Console = command/control surface
- Debug Overlay = telemetry/visual surface
- Providers = read-only normalization seam for overlay panels

## Integration Reference
- `samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/MultiSystemDemoScene.js`

## Provider Contract Draft
Recommended descriptor shape:

```js
{
  id: "system.frame",
  version: "1.0.0",
  collect(context) { ... },
  isAvailable?(context) { ... }
}
```

Rules:
1. `id` must be unique and stable.
2. `collect(context)` is required and read-only.
3. `isAvailable` is optional and side-effect free.
4. Provider output should be plain JSON-safe data.

## Recommended Provider IDs
- `system.frame`
- `scene.active`
- `scene.entities`
- `render.layers`
- `debug.status`

## Panel Consumption Contract
Overlay host builds provider snapshots and passes:

```js
ctx.providers = {
  "system.frame": {...},
  "render.layers": {...}
};
```

Panels read from `ctx.providers[...]` only.

## Guardrails
- no direct panel runtime reads
- no provider-to-console calls
- no overlay host special-case branches per panel
- no mutations inside provider `collect`

## Validation Goals
- deterministic provider snapshot availability per frame/update pass
- graceful fallback when a provider is unavailable
- panels render from providers without runtime reach-through
- no engine core changes

## BUILD_PR Command
`BUILD_PR_OVERLAY_DATA_PROVIDERS`

## Commit Comment
`docs: define read-only overlay data provider contract for sample-level panel telemetry`

## Next Command
`APPLY_PR_OVERLAY_DATA_PROVIDERS`
