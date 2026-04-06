# PLAN_PR_DEBUG_SURFACES_STANDARD_LIBRARY

## Objective
Define a docs-only plan for the first reusable standard library for promoted debug surfaces.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: plan a small, opt-in shared standard library.

## Scope
In scope:
- first shared panels/providers/operator commands
- naming conventions
- shared registration strategy
- adoption models and boundaries

Out of scope:
- implementation in this PR
- 3D-specific diagnostics
- network-specific diagnostics
- deep-inspector tooling
- project-specific debug logic in shared library

## Direction
- Keep the initial library intentionally small.
- Keep adoption explicitly opt-in.
- Keep project/sample/tool-specific panels/providers/commands outside shared layers.

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
- `system.timing`
- `scene.summary`
- `scene.entities`
- `render.layers`
- `input.summary`
- `debug.status`

### Operator Commands
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
- Panel and provider IDs use stable dot notation.
- Shared commands use `debug.*` and `overlay.*` namespaces.
- Shared IDs remain generic and runtime-agnostic.

## Adoption Principle
Use a single shared entry point for standard adoption:
- `registerStandardDebugPreset()`

## Boundaries
- Shared library contains only reusable baseline debug capability.
- Project-specific panels/providers/commands remain local.

## Next Commands
1. `BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY`
2. `APPLY_PR_DEBUG_SURFACES_STANDARD_LIBRARY`
