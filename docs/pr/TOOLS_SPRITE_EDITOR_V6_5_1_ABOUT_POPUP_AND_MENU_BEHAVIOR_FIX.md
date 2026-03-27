# TOOLS_SPRITE_EDITOR_V6_5_1_ABOUT_POPUP_AND_MENU_BEHAVIOR_FIX

## Purpose
Fix the v6.5 validation failures around About popup detection, shared menu close behavior, and no-ESC editor handling.

## Problems Confirmed
- About did not validate as a clear popup surface.
- Close button was not reliably detectable/usable.
- Ctrl+W did not reliably close About.
- ESC still appears to affect editor-owned UI in at least one path.
- Other menus no longer validate cleanly after the About changes.

## Scope
Surgical behavior/UI fix only.
Do not redesign the editor.
Do not change menu order.
Do not reintroduce ESC close/cancel behavior.

## Required Changes

### 1. Normalize About as a true popup surface
- Render About as a clearly distinct centered popup/modal surface.
- Ensure it has its own stable visible bounds, title text, and body content.
- Ensure it is not using dropdown/menu rendering code paths.

### 2. Make About close button explicit and detectable
- Add a clear visible `Close` button inside the popup.
- Use clear label text exactly: `Close`
- Ensure the button has a stable rect, hit-test path, and draw path.

### 3. Route About through the shared close-surface path
- Ctrl+W must close About through the same centralized surface-close function as other transient surfaces.
- Opening another top-level menu should close About first if only one transient surface is allowed.

### 4. Remove any remaining editor-owned ESC handling
- Audit all keyboard and popup/menu paths again.
- ESC must not:
  - close About
  - close menus
  - close overlays
  - cancel interactions
- ESC should be left to browser/fullscreen only.

### 5. Re-stabilize other menu behavior
- Files / Tools / Edit / Frame / Layer menus must still:
  - open with visible items
  - close on click-outside
  - close with Ctrl+W
  - maintain only one open menu at a time

### 6. Keep popup visibility simple and validator-friendly
- Avoid subtle or low-contrast popup presentation.
- Keep title/content/button text explicit and readable.
- Do not rely on hidden state or reused menu visuals that may look like a dropdown.

## Acceptance
- About opens as a centered popup surface, not a dropdown.
- About popup content is visibly detectable.
- About popup includes a visible `Close` button.
- Clicking `Close` closes the popup.
- Ctrl+W closes the About popup.
- ESC is not consumed by editor UI.
- Other menus still open and close normally.
- No console errors.

## Notes
This is a follow-up fix to the v6.5 popup/menu pass.
Keep it small and centralized.
