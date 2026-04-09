# APPLY_PR_PLUGIN_SYSTEM

## Purpose
Apply BUILD_PR_PLUGIN_SYSTEM exactly as defined.

## Scope
- Plugin system contracts finalized
- Lifecycle hooks enforced
- Isolation rules applied
- Optional loading model preserved

## Rules
- No runtime mutation outside approved boundaries
- No breaking changes
- Preserve src/engine/runtime separation

## Validation
- Plugins register/unregister correctly
- Lifecycle works (init, activate, deactivate, dispose)
- Isolation enforced
- No regressions

## Roadmap Update
Track J:
- Plugin system -> [x]

(Bracket-only change)

## Output
<project folder>/tmp/APPLY_PR_PLUGIN_SYSTEM_delta.zip