Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_DEBUG_COMBO_KEYS_PATCH.md

# BUILD PR
Replace F-key debug bindings with browser-safe combo keys

## Changes
- Remove all F-key bindings (F3, F6, F7, F8, F9)
- Add combo keys:
  Shift + `  => toggle console
  Ctrl + Shift + ` => toggle overlay
  Ctrl + Shift + R => reload scene
  Ctrl + Shift + ] => next panel
  Ctrl + Shift + [ => previous panel

## Constraints
- No engine core changes
- Only modify dev console integration file
- Use preventDefault only for handled combos
- Keep behavior isolated

## Validation
- F keys no longer trigger debug
- Combo keys work without browser conflict
- Console and overlay toggle correctly
