MODEL: GPT-5.4
REASONING: medium

COMMAND:
Run browser validation for the v6.2 Sprite Editor input remap in tools/SpriteEditor/main.js.

VALIDATIONS:
- ESC exits fullscreen and is not consumed by the editor
- ESC does not close menus, overlays, command palette, or active interactions
- Command palette toggles with Ctrl+P
- Ctrl+W closes the active transient surface:
  - menus
  - rename overlay
  - replace/confirm overlay
  - command palette
- Right-click cancels active interactions
- Backspace cancels active interactions when not typing
- Click-outside still closes menus
- No console errors during the validation pass

OUTPUT:
- Report each validation as PASS / FAIL / BLOCKED
- Include exact repro steps for any FAIL
- Include exact blocker reason for any BLOCKED
- Do not leave temporary validation files in the repo
