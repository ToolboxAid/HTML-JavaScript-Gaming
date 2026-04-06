# APPLY_PR_DEBUG_SURFACES_PRESETS

## Objective
Apply the approved presets build as a focused implementation PR with no expansion beyond the v1 preset scope.

## Apply Scope
- implement `DebugPresetRegistry`
- implement `DebugPresetApplier`
- implement `registerStandardDebugPresets()` with v1 shared inventory
- implement `registerPresetCommands()` with v1 command set

## Guardrails
- keep v1 to visibility + optional ordering
- use public APIs only
- keep project-specific presets outside shared layer
- preserve precedence with persistence exactly as defined
- no excluded scope features

## Apply Validation
- preset registry/applier functions pass deterministic behavior checks
- shared preset inventory loads and applies
- preset command set works with safe failures
- precedence with persistence is correct
- no project-specific preset implementation leaks into shared layer

## Expected Outcome
A small, opt-in presets system for promoted debug surfaces is ready with clear extension boundaries.
