# TOOLS_SPRITE_EDITOR_V7_0_INTERACTION_AND_CORE_FIXES_BUILD_PR

## Intent
This is the code-level BUILD_PR pack for the V7.0 stabilization fixes.

Because the current `tools/SpriteEditor/main.js` source was not available in this chat as an uploaded file, this pack is written as **anchor-based code edits** against the known function names and UI paths already referenced during the work:
- `cancelActiveInteraction()`
- `applyNamedPalette()`
- `drawMainGrid()`
- `openPaletteWorkflowMenu()`
- timeline transport / range UI
- current color readout rendering
- top-level menu/input handling in `main.js`

Use the snippets in `PATCH_SNIPPETS.md` as the source of truth for the implementation.

## Required outcomes
- Remove all `Ctrl+W` editor bindings
- Backspace cancels active interaction when not typing
- Selection move preserves content
- Palette scroll reaches true end of palette
- Timeline `Range` works or is removed from UI
- Timeline header is visible
- Current color line is rendered on one line:
  `Current: #AABBCC [■] Named: Sky Blue`

## Validation targets
- No `Ctrl+W` editor close path remains
- `Backspace` cancel works
- Moving a selection does not clear pixels unexpectedly
- Large palettes scroll to the final color
- Timeline `Range` is either correct or hidden
- `Timeline` label is visible
- Current color line format is correct
- No console errors
