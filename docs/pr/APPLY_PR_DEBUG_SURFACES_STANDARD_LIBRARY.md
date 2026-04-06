# APPLY_PR_DEBUG_SURFACES_STANDARD_LIBRARY

## Purpose

Apply the approved standard library plan by creating the first reusable set of shared panels, providers, commands, and preset registration in `engine/debug/standard`.

## Apply Scope

### Create Shared Panels
- system fps
- system timing
- scene summary
- scene entities
- render layers
- input summary
- debug status

### Create Shared Providers
- timing
- scene summary
- entity counts
- render layer summary
- input summary
- debug status

### Create Shared Commands
- debug help/status
- overlay list/status/show/hide/toggle/showAll/hideAll

### Create Shared Preset
- `registerStandardDebugPreset()`

## Keep Local
- game-specific panels
- game-specific providers
- game-specific commands
- tool-specific panels
- tool-specific adapters
- scene-specific wiring

## Apply Rules

- keep adoption opt-in
- preserve public API boundaries
- do not pull custom project logic into the shared library
- validate through sample and tool integrations
- do not expand beyond the approved initial inventory
