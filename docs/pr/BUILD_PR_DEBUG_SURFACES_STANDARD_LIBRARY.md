# BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY

## Purpose

Convert the approved standard library plan into an implementation-ready docs bundle for Codex.

## Authoritative Target Structure

```text
src/
  engine/
    debug/
      standard/
        panels/
          SystemFpsPanel.js
          SystemTimingPanel.js
          SceneSummaryPanel.js
          SceneEntitiesPanel.js
          RenderLayersPanel.js
          InputSummaryPanel.js
          DebugStatusPanel.js
        providers/
          SystemTimingProvider.js
          SceneSummaryProvider.js
          EntityCountProvider.js
          RenderLayerSummaryProvider.js
          InputSummaryProvider.js
          DebugStatusProvider.js
        commands/
          registerStandardDebugCommands.js
        presets/
          registerStandardDebugPreset.js
```

## Initial Inventory

### Shared Panels
- `system.fps`
- `system.timing`
- `scene.summary`
- `scene.entities`
- `render.layers`
- `input.summary`
- `debug.status`

### Shared Providers
- `systemTiming`
- `sceneSummary`
- `entityCount`
- `renderLayerSummary`
- `inputSummary`
- `debugStatus`

### Shared Commands
- `debug.help`
- `debug.status`
- `overlay.list`
- `overlay.status`
- `overlay.show <panelId>`
- `overlay.hide <panelId>`
- `overlay.toggle <panelId>`
- `overlay.showAll`
- `overlay.hideAll`

## Registration Pattern

Use one shared registration entry point:

- `registerStandardDebugPreset()`

This preset should:
1. register shared providers
2. register shared panels
3. register shared commands

This keeps adoption simple and consistent.

## Adoption Modes

### Minimal Adoption
Consumer registers:
- 1–2 standard providers
- 1–2 standard panels
- optional shared commands

### Standard Adoption
Consumer registers:
- full `registerStandardDebugPreset()`

### Custom Adoption
Consumer registers:
- selected shared providers/panels/commands
- local project-specific additions

## Build Rules

- one PR purpose only
- docs-first only
- keep the initial library small
- no 3D-specific diagnostics
- no network-specific diagnostics
- no deep inspectors
- no game-specific logic in shared panels
- no direct runtime access from shared panels
- shared panels consume shared/public providers only
- shared commands act through public APIs only

## Validation Goals

- shared preset registers end-to-end
- panels render from provider data only
- commands operate through public overlay/debug APIs
- partial adoption works
- full adoption works
- local project extensions remain possible
- no project-specific logic leaks into the shared library

## Rollback Strategy

If the initial library is too broad or unstable:
- keep the directory structure
- reduce the initial inventory
- preserve preset entry point
- revalidate minimal adoption before re-expanding
