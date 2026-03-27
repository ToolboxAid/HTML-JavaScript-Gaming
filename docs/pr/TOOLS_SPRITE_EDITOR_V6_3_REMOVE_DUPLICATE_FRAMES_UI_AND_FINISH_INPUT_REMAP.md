# TOOLS_SPRITE_EDITOR_V6_3_REMOVE_DUPLICATE_FRAMES_UI_AND_FINISH_INPUT_REMAP

## Purpose
Clean up duplicated frame UI and finish the v6.2 input remap so behavior matches the new rules.

## Problems Observed
1. There are two frame surfaces:
   - legacy Frames UI under Frames/menu area -> REMOVE
   - timeline frame strip -> KEEP
2. ESC is still affecting editor state in at least one path and must be fully removed from editor-owned close/cancel behavior.
3. Ctrl+W does not close every transient surface consistently.
4. Backspace cancel path exists, but validator did not detect complete cancel feedback / completion.

## Scope
Surgical cleanup only.
Do not redesign the editor.
Do not reintroduce ESC handling.
Keep timeline as the single frame-management surface.

## Required Changes

### 1. Remove duplicate legacy Frames UI
- Remove the old secondary frame list/panel/surface under the Frames area.
- Keep only the timeline frame strip as the frame UI.
- Keep frame actions reachable from menu/commands, but do not render a second persistent frame surface.
- Remove any layout allocation, draw calls, hit-testing, and input handling tied only to the legacy duplicated frame surface.

### 2. Timeline remains the only frame surface
- Timeline frame strip stays visible and interactive.
- Frame selection, add, duplicate, delete, reorder, and playback-related interactions should anchor to the timeline only.

### 3. Fully remove ESC from editor-owned close/cancel flows
- Audit all keyboard and transient-surface paths.
- Ensure ESC does not:
  - close menus
  - close overlays
  - close command palette
  - cancel active interactions
- ESC should be left to browser/fullscreen behavior only.

### 4. Normalize Ctrl+W close behavior
- Ctrl+W must close exactly one active transient surface using a single centralized path.
- Supported surfaces:
  - menus
  - rename overlay
  - replace/confirm overlay
  - command palette
- If no transient surface is open, editor should do nothing.

### 5. Normalize Backspace cancel behavior
- Backspace when not typing must cancel active interactions through a single centralized cancel path.
- Supported interaction examples:
  - brush drag
  - move/drag
  - shape preview
  - pan
  - transient selection interaction
- Cancel must:
  - clear transient state
  - stop the interaction
  - emit visible cancel feedback
  - avoid creating a cancel-only history entry

### 6. Keep right-click cancel behavior
- Right-click cancel remains valid and should use the same centralized cancel path as Backspace.

## Acceptance
- Only one frame UI remains: the timeline.
- Legacy duplicate Frames surface is gone.
- ESC exits fullscreen only and does not alter editor UI state.
- Ctrl+W closes each transient surface correctly.
- Backspace cancels active interactions when not typing and shows visible feedback.
- Right-click still cancels active interactions.
- No cancel-only history entry is created.
- No console errors.

## Notes
This is a cleanup/fix follow-up to the v6.2 input remap.
Do not add new shortcuts beyond what is required above.
