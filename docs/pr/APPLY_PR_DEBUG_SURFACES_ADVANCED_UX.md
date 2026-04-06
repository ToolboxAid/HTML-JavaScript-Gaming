# APPLY_PR_DEBUG_SURFACES_ADVANCED_UX

## Execution Steps
1. Create DebugPanelGroupRegistry
2. Create DebugMacroRegistry and DebugMacroExecutor
3. Implement group commands (group.*)
4. Implement macro commands (macro.*)
5. Implement quick toggle commands (toggle.*)
6. Optional: shortcut bindings
7. Validate:
   - groups toggle correctly
   - macros execute via public commands
   - toggles behave consistently

## Rules
- Macros compose public APIs only
- No direct runtime mutation
- Keep shortcuts optional
