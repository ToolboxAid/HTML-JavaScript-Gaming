# APPLY_PR_DEBUG_SURFACES_3D_SUPPORT

## Purpose

Apply the approved 3D support plan by creating the first shared 3D panels, providers, and optional presets for the debug surfaces platform.

## Apply Scope

### Create Shared 3D Panels
- transform
- camera
- render stages
- collision
- scene graph

### Create Shared 3D Providers
- transform summary
- camera summary
- render stage summary
- collision volume summary
- scene graph summary

### Create Optional Shared 3D Presets
- 3d inspect
- 3d render
- 3d camera

### Keep Local
- renderer-specific adapters
- scene-specific extraction
- project-specific debug visuals

## Apply Rules

- keep adoption opt-in
- preserve existing platform patterns
- keep shared logic renderer-agnostic
- validate through a 3D-capable sample or staged adapter harness
