# BUILD_PR_DEBUG_SURFACES_3D_SUPPORT

## Purpose
Build a docs-only, implementation-ready bundle for the first reusable 3D support layer in the debug surfaces platform.

## Build Mode
- Docs-only
- One PR purpose only
- No engine/runtime implementation files

## Scope
In scope:
- Shared 3D panel inventory (summary-level)
- Shared 3D provider inventory (read-only snapshots)
- Optional shared 3D presets
- Adapter boundary contracts
- Adoption models and naming conventions
- Validation and rollout guidance

Out of scope:
- Renderer-specific implementations
- Deep inspectors
- Network/multiplayer support
- Project-specific adapters in shared layer

## Shared 3D Inventory
Panels:
- `panel.3d.transforms`
- `panel.3d.camera`
- `panel.3d.renderStages`
- `panel.3d.collisions`
- `panel.3d.sceneGraph`

Providers:
- `provider.3d.transforms.snapshot`
- `provider.3d.camera.snapshot`
- `provider.3d.renderStages.snapshot`
- `provider.3d.collisions.snapshot`
- `provider.3d.sceneGraph.snapshot`

Optional presets:
- `preset.3d.inspect`
- `preset.3d.render`
- `preset.3d.camera`

## Adapter Boundaries
Shared layer responsibilities:
- Define generic panel/provider/preset descriptors.
- Provide registration seams and naming conventions.

Project/sample responsibilities:
- Renderer-specific data extraction.
- Scene-specific mapping.
- Project-owned adapter implementations.

## Naming Conventions
- Panels: `panel.3d.<domain>`
- Providers: `provider.3d.<domain>.snapshot`
- Presets: `preset.3d.<name>`

## Target Structure
```text
engine/
  debug/
    standard/
      threeD/
        panels/
        providers/
        presets/
```

## Guardrails
See `docs/pr/BUILD_PR_DEBUG_SURFACES_3D_SUPPORT_GUARDRAILS.md`.

## Validation Goals
- Shared 3D inventory is explicit and reusable.
- Shared layer remains renderer-agnostic.
- Project-specific adapters stay outside shared layer.
- Scope remains summary-level and opt-in.

## Rollout Notes
1. Keep this BUILD docs-only.
2. APPLY should implement in small slices:
   - provider contracts
   - panels
   - optional presets
3. Preserve existing 2D debug behavior parity.
