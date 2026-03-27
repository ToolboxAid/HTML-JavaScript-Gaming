# TOOLS_SPRITE_EDITOR_V7_0_INTERACTION_AND_CORE_FIXES

## Purpose
Stabilize core interaction behavior and fix blocking issues before full regression.

## Includes

### 1. Remove Ctrl+W usage
- Remove ALL Ctrl+W bindings
- Do not override browser tab close behavior

### 2. Fix Backspace cancel
- Backspace cancels active interaction when NOT typing
- Must route through cancelActiveInteraction()

### 3. Fix selection tool data loss
- Moving a selection must NOT clear original content incorrectly
- Ensure selection buffer is preserved

### 4. Fix palette scroll bounds
- Ensure full palette is scrollable
- No hidden bottom colors
- Scroll range must match full palette height

### 5. Fix or remove Timeline Range
- If implemented: respect range during playback
- If not stable: hide/remove Range control

### 6. Add Timeline header
- Add visible label "Timeline"

### 7. Improve Current Color Display
Render on ONE line:
Current: #AABBCC [■] Named: Sky Blue

## Acceptance
- Ctrl+W no longer used anywhere
- Backspace cancels interaction correctly
- Selection move does not destroy pixels
- Palette fully scrollable
- Timeline range behaves correctly OR is removed
- Timeline has header
- Current color line formatted correctly
- No console errors
