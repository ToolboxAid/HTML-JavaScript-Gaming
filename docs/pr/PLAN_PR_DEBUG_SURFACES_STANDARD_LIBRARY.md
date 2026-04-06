# PLAN_PR_DEBUG_SURFACES_STANDARD_LIBRARY

## Objective

Plan the first reusable standard library for the promoted debug surfaces platform so games, tools, and samples can adopt a consistent baseline set of panels, providers, and operator commands.

## Approved Direction

- Build a small, opt-in shared library under `engine/debug/standard`
- Keep shared contents focused on high-value baseline diagnostics
- Keep project-specific panels/providers/commands local
- Defer 3D, network, and deep-inspector work to later tracks

## Initial Shared Scope

### Panels
- `system.fps`
- `system.timing`
- `scene.summary`
- `scene.entities`
- `render.layers`
- `input.summary`
- `debug.status`

### Providers
- `systemTiming`
- `sceneSummary`
- `entityCount`
- `renderLayerSummary`
- `inputSummary`
- `debugStatus`

### Commands
- `debug.help`
- `debug.status`
- `overlay.list`
- `overlay.status`
- `overlay.show <panelId>`
- `overlay.hide <panelId>`
- `overlay.toggle <panelId>`
- `overlay.showAll`
- `overlay.hideAll`
