MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply input remap to remove ESC handling and use alternative controls

VALIDATIONS:
- ESC always exits fullscreen
- ESC does not close menus, overlays, or interactions
- Menus close via click-outside or Ctrl+W
- Command palette toggles with Ctrl+P and closes with Ctrl+W
- Active interactions cancel via right-click or Backspace
- No console errors
