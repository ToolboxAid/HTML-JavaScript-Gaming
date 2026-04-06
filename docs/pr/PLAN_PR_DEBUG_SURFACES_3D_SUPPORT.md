# PLAN_PR_DEBUG_SURFACES_3D_SUPPORT

## Objective
Plan the first reusable, opt-in 3D support layer for the debug surfaces platform.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: define the summary-level 3D shared layer contract for debug surfaces.

## Goals
- Define shared 3D panel inventory.
- Define shared 3D provider inventory.
- Define optional shared 3D preset inventory.
- Define adapter boundaries between shared and project-specific layers.
- Define adoption models and naming conventions.
- Define target structure for future BUILD/APPLY.

## In Scope
- Shared 3D panel descriptors (summary-level only).
- Shared 3D provider descriptor contracts (read-only snapshots).
- Optional shared 3D presets (visibility + optional ordering only).
- Public adapter boundaries and ownership matrix.
- Target folder layout and rollout phases.

## Out of Scope
- Renderer-specific implementations.
- Deep inspectors.
- Network or multiplayer debug support.
- Project-specific renderer/scene adapters in shared layer.
- Engine-core rewrites.

## Shared 3D Panels (v1, summary-level)
- `panel.3d.transforms`
  - Position/rotation/scale summary counts and active selection summary.
- `panel.3d.camera`
  - Camera mode, clip planes, fov/zoom, active camera id.
- `panel.3d.renderStages`
  - Stage timing/count summary and enabled stage list.
- `panel.3d.collisions`
  - Collider counts, broadphase/narrowphase summary metrics.
- `panel.3d.sceneGraph`
  - Node count, depth summary, active subtree summary.

## Shared 3D Providers (v1)
- `provider.3d.transforms.snapshot`
- `provider.3d.camera.snapshot`
- `provider.3d.renderStages.snapshot`
- `provider.3d.collisions.snapshot`
- `provider.3d.sceneGraph.snapshot`

Provider guardrails:
- read-only snapshots only
- deterministic shape/version fields
- no direct runtime mutation

## Optional 3D Presets (v1)
- `preset.3d.inspect`
- `preset.3d.render`
- `preset.3d.camera`

Preset scope remains:
- panel visibility
- optional panel ordering

## Adapter Boundaries
Shared layer (`engine/debug`):
- shared panel descriptors
- shared provider contracts
- shared optional presets
- shared registration entry points

Project/sample/tool layer:
- renderer-specific provider adapters
- scene/runtime extraction logic
- project-specific panel/provider variants

Hard rule:
- shared layer never imports project/sample renderer internals.

## Adoption Models
Minimal:
- 1 provider + 1 panel + local adapter bridge.

Standard:
- register all shared 3D providers/panels + optional shared 3D presets.

Hybrid:
- shared 3D base + project-local adapters and optional project-local panels.

## Naming Conventions
- Panel ids: `panel.3d.<domain>`
- Provider ids: `provider.3d.<domain>.snapshot`
- Preset ids: `preset.3d.<name>`
- Group ids (future): `group.3d.<name>`

## Target Structure (authoritative for BUILD)
```text
engine/
  debug/
    standard/
      threeD/
        panels/
          panel.3d.transforms.js
          panel.3d.camera.js
          panel.3d.renderStages.js
          panel.3d.collisions.js
          panel.3d.sceneGraph.js
        providers/
          provider.3d.transforms.snapshot.js
          provider.3d.camera.snapshot.js
          provider.3d.renderStages.snapshot.js
          provider.3d.collisions.snapshot.js
          provider.3d.sceneGraph.snapshot.js
        presets/
          registerStandard3dDebugPresets.js
          preset.3d.inspect.js
          preset.3d.render.js
          preset.3d.camera.js
```

## Validation Goals
- Shared 3D inventory is explicit and renderer-agnostic.
- Shared layer boundaries are explicit and enforce local adapter ownership.
- Optional 3D presets remain opt-in and small.
- BUILD/APPLY can proceed without engine-core rewrites.

## Risks and Controls
Risk: shared layer drifts into renderer-specific behavior.
Control: keep provider contracts summary-only and enforce project-local adapters.

Risk: scope expands into deep inspector tooling.
Control: defer deep inspection to a separate PR track.

Risk: accidental network scope creep.
Control: network support remains excluded from this PR.

## BUILD Command
`BUILD_PR_DEBUG_SURFACES_3D_SUPPORT`

## Commit Comment
`docs: plan reusable opt-in 3D support layer for debug surfaces`

## Next Command
`BUILD_PR_DEBUG_SURFACES_3D_SUPPORT`
