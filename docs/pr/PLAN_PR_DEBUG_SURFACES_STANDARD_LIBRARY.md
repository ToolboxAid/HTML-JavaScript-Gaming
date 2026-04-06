# PLAN_PR_DEBUG_SURFACES_STANDARD_LIBRARY

## Objective
Plan the first reusable, opt-in standard library for promoted debug surfaces so projects can adopt a consistent baseline without pulling project-specific logic into shared layers.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: define the standard library plan.

## Scope
In scope:
- shared panel candidates
- shared provider candidates
- shared operator command candidates
- adoption models
- naming conventions
- target structure and ownership boundaries
- validation strategy, risk controls, and rollout notes

Out of scope:
- implementation in this PR
- 3D-specific diagnostics
- network-specific diagnostics
- deep-inspector features
- promotion of project-specific debug artifacts into shared library

## Design Constraints
- docs-first only
- keep initial library small
- keep adoption opt-in
- preserve Dev Console (command/control) vs Debug Overlay (telemetry/visual) separation
- keep project-specific panels/providers/commands outside shared library

## Ownership Model
### Engine Core (minimal)
- contracts/hooks only when required
- no shared panel/provider/command implementations

### Engine Debug (shared implementation)
- standard library shared panels/providers/commands
- shared registration helpers and small presets

### Project/Sample/Tool Layers (local)
- project-specific panels/providers/commands
- scene/tool adapters and defaults
- custom local presets

## Initial Standard Library (Small Baseline)
### Shared Panels (initial)
- `system.fps`
- `system.timing`
- `scene.summary`
- `scene.entities`
- `render.layers`
- `input.summary`
- `debug.status`

### Shared Providers (initial)
- `system.timing`
- `scene.summary`
- `scene.entities`
- `render.layers`
- `input.summary`
- `debug.status`

### Shared Operator Commands (initial)
- `debug.help`
- `debug.status`
- `overlay.list`
- `overlay.status`
- `overlay.show <panelId>`
- `overlay.hide <panelId>`
- `overlay.toggle <panelId>`
- `overlay.showAll`
- `overlay.hideAll`
- `overlay.order`

## Naming Conventions
### Panel IDs
- dot notation, stable and human-readable
- examples: `system.fps`, `scene.summary`, `render.layers`

### Provider IDs
- align with panel domain IDs where practical
- examples: `system.timing`, `scene.entities`, `debug.status`

### Command Namespaces
- `debug.*` for console-level status/help
- `overlay.*` for overlay operator controls

## Target Structure
```text
engine/
  debug/
    standard/
      panels/
        system/
        scene/
        render/
        input/
        debug/
      providers/
        system/
        scene/
        render/
        input/
        debug/
      commands/
        registerStandardDebugCommands.js
      presets/
        registerStandardDebugPreset.js
```

Project/sample/tool-owned custom debug artifacts remain outside this shared tree.

## Adoption Models
### Minimal Adoption
- register shared commands
- register 1-3 providers
- register 1-3 panels

### Preset Adoption
- register standard preset bundle
- override with local excludes/includes

### Hybrid Adoption
- use shared commands/providers
- replace or extend panel set locally

## Validation Strategy
- contract validation: shared IDs follow naming conventions and remain stable
- behavior validation: shared commands operate through public APIs only
- integration validation: sample/tool can adopt minimal set without custom refactors
- boundary validation: no project-specific panels/providers/commands promoted into shared library

## Risk Controls
- keep initial baseline small to prevent scope creep
- reject runtime-specific leakage into shared providers/panels
- require opt-in registration (no forced defaults)
- keep advanced inspections deferred to future PRs

## Rollout Notes
1. This PLAN PR is docs-only.
2. BUILD PR defines authoritative inventory and implementation map.
3. APPLY PR implements initial library incrementally with sample-level proving.
4. Expansion (3D, network, deep inspector) requires separate PRs.

## Next Commands
1. `BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY`
2. `APPLY_PR_DEBUG_SURFACES_STANDARD_LIBRARY`
