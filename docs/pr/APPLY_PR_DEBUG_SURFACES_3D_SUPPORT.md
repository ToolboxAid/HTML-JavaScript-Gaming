# APPLY_PR_DEBUG_SURFACES_3D_SUPPORT

## Purpose

Apply the approved 3D support plan by creating the first shared 3D panels, providers, and optional presets for the debug surfaces platform.

## Apply Scope

### Create Shared 3D Providers
- `transformSummary`
- `cameraSummary`
- `renderStageSummary`
- `collisionSummary`
- `sceneGraphSummary`

### Create Shared 3D Panels
- `3d.transform`
- `3d.camera`
- `3d.renderStages`
- `3d.collision`
- `3d.sceneGraph`

### Create Optional Shared 3D Presets
- `preset.3d.inspect`
- `preset.3d.render`
- `preset.3d.camera`

### Keep Local
- renderer-specific adapters
- scene-specific extraction
- project-specific debug visuals
- engine-specific stage mappings

## Execution Order

1. Create summary-level 3D providers
2. Create shared 3D panels consuming providers only
3. Create optional shared 3D presets
4. Add registration entry points
5. Wire a sample adapter harness or 3D-capable sample integration
6. Validate renderer-agnostic behavior and adapter boundaries

## Rules

- Keep adoption opt-in
- Preserve existing provider/panel/preset conventions
- Shared layer must stay renderer-agnostic
- Panels must consume provider data only
- No deep inspectors in this PR
- No renderer-specific logic in shared layer
- No network support in this PR
