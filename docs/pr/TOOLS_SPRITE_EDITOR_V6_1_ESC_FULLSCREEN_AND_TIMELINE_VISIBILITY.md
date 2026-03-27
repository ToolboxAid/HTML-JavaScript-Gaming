# TOOLS_SPRITE_EDITOR_V6_1_ESC_FULLSCREEN_AND_TIMELINE_VISIBILITY

## Purpose
Fix validation blockers:
- ESC exits fullscreen too early
- ESC does not cancel active interaction
- Timeline not always visible
- Playback controls not always visible
- Layout overlap issues
- Missing visible feedback

## Scope
Surgical fix only.
No architecture changes.
Canvas control surface remains authority.

## Plan

### 1. Centralize ESC handling
Create handleEscapeAction() with priority:
1) close overlays
2) close menus
3) close command palette
4) cancel interaction
5) allow fullscreen exit

### 2. Gate fullscreen exit
Only exit fullscreen if ESC not consumed.

### 3. Cancel interaction safely
Clear drag, selection, preview state.
No history entry.
Emit status.

### 4. Reserve layout regions
Top: menus
Center: canvas
Right: layers
Bottom: timeline + playback

### 5. Always visible timeline/playback
Use fixed layout, not leftover space.

### 6. Clamp menus
Keep menus on screen.
Show fallback row if empty.

### 7. Add feedback
Frame added
Frame duplicated
Playback range set/cleared
Nothing to save
Load/Export not available

## Acceptance
- ESC works in correct order
- Fullscreen exits only when safe
- Timeline visible
- Playback visible
- No overlap
- Menus visible
- Actions show feedback
