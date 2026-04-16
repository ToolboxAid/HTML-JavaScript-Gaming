# BUILD_PR_LEVEL_19_3_OVERLAY_INTERACTION_CONTROLS

## Purpose
Add testable interaction controls for gameplay-safe overlays introduced in Level 19.2 so overlays can be shown, hidden, and cycled without interfering with gameplay input.

## Scope
- Define gameplay-safe overlay interaction controls
- Keep debug-overlay behavior intact
- Ensure overlay interaction does not steal or block primary gameplay controls
- Validate control behavior in at least one gameplay-active sample

## Included
- Interaction control contract for gameplay overlays
- Runtime hookup for overlay show/hide/cycle actions in gameplay context
- Tests covering non-interference with gameplay controls
- Validation notes for control behavior

## Excluded
- New overlay types
- Overlay visual redesign
- Mission or telemetry feature expansion
- Repo-wide input cleanup

## Execution Notes
- Use the shared input mapping established by prior overlay/input consolidation work
- Preserve current non-Tab overlay cycle behavior
- Keep scope to the smallest executable/testable change
- Do not modify start_of_day folders

## Test Steps
1. Load a gameplay-active sample with overlays enabled
2. Trigger overlay show/hide control
3. Trigger overlay cycle control
4. Confirm gameplay movement/actions still work while overlay controls are used
5. Confirm debug overlay behavior remains unchanged where applicable

## Expected Result
- Gameplay overlays can be interacted with safely
- Overlay controls do not interfere with core gameplay input
- Existing debug overlay behavior remains stable
