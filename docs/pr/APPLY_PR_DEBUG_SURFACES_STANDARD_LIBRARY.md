# APPLY_PR_DEBUG_SURFACES_STANDARD_LIBRARY

## Purpose

Apply the approved standard library plan by creating the first reusable set of shared panels, providers, and operator commands in `engine/debug/standard`.

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
- overlay status/list/show/hide/toggle/showAll/hideAll

### Keep Local
- game-specific panels
- game-specific providers
- game-specific commands
- scene-specific adapters

## Apply Rules

- keep adoption opt-in
- preserve public API boundaries
- do not pull custom game logic into the shared library
- validate through sample and tool integrations
