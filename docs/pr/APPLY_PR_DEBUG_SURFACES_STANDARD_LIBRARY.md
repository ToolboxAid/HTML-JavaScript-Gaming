# APPLY_PR_DEBUG_SURFACES_STANDARD_LIBRARY

## Objective
Apply the approved standard library build as a focused implementation PR with opt-in adoption and no excluded scope expansion.

## Apply Scope
- implement shared panels/providers/operator commands from the approved v1 inventory
- implement `registerStandardDebugPreset()` as the main shared adoption entry point
- keep project-specific panels/providers/commands outside shared library

## Apply Rules
- no 3D-specific additions
- no network-specific additions
- no deep-inspector additions
- no project-specific logic in shared library
- use public APIs/contracts only

## Apply Validation
- standard preset registration succeeds
- minimal and standard adoption both function
- commands and panels follow naming conventions
- shared panels consume provider snapshots only
- boundary checks confirm project-specific logic remains local

## Expected Outcome
A small, opt-in, reusable debug standard library baseline under `engine/debug/standard` with clear extension boundaries.
