Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_OVERLAY_DATA_PROVIDERS.md

# BUILD_PR_OVERLAY_DATA_PROVIDERS

## Objective
Produce a docs-first BUILD bundle for a read-only Overlay Data Provider layer that keeps Dev Console and Debug Overlay responsibilities separated.

## Build Constraints
- one PR purpose only
- no engine core changes
- sample-level integration only
- preserve Dev Console vs Debug Overlay boundary

## Integration Reference
- `samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/MultiSystemDemoScene.js`

## Provider Layer Contract
Provider descriptor:

```js
{
  id: "render.layers",
  version: "1.0.0",
  collect(context) { ... },
  isAvailable?(context) { ... }
}
```

Provider snapshot map:

```js
{
  "system.frame": {...},
  "scene.active": {...},
  "scene.entities": {...},
  "render.layers": {...},
  "debug.status": {...}
}
```

Panel context boundary:

```js
{
  providers,
  frame,
  layout,
  flags
}
```

Panels must read from `providers` only.

## Recommended Provider IDs
- `system.frame`: fps, deltaMs, frameIndex
- `scene.active`: sceneId, sceneState
- `scene.entities`: total, activeGroups
- `render.layers`: orderedLayerNames, visibleCount
- `debug.status`: overlayVisible, panelCount, errors

## Approved Console Interactions
Allowed through public registry/provider host calls only:
- list provider IDs
- query provider availability/status
- trigger safe provider snapshot refresh request (no direct panel mutation)

Not allowed:
- console invoking panel render internals
- console mutating provider descriptor shape
- provider calling console actions

## Guardrails
1. Providers are read-only and side-effect free.
2. Overlay host owns provider snapshot collection.
3. Panels do not perform direct runtime reads.
4. Overlay host must not hardcode panel special cases.
5. Any missing provider data must degrade gracefully.

## Validation
- valid descriptor accepted
- invalid descriptor rejected with structured error
- duplicate provider id rejected
- snapshot map deterministic for a given input frame
- panel rendering succeeds with partial provider availability
- boundary checks confirm no panel-to-console coupling

## Accomplishments Summary
- Boundary between Dev Console and Debug Overlay already documented and preserved.
- Overlay panel registry contract already documented for deterministic panel ordering.
- This BUILD adds the missing read-only data seam so panels become purely presentational.

## Next-Step Recommendations
1. `APPLY_PR_OVERLAY_DATA_PROVIDERS`
2. `BUILD_PR_OVERLAY_PROVIDER_HEALTH_PANEL`
3. `BUILD_PR_OVERLAY_PANEL_PRESETS_AND_TOGGLES`

## Deliverables In This Bundle
- `docs/pr/PLAN_PR_OVERLAY_DATA_PROVIDERS.md`
- `docs/pr/BUILD_PR_OVERLAY_DATA_PROVIDERS.md`
- `docs/pr/APPLY_PR_OVERLAY_DATA_PROVIDERS.md`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`
