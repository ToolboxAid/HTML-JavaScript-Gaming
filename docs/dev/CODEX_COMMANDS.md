MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Patch dev console input system.

Modify:
tools/dev/devConsoleIntegration.js

Add:
- cursor-based input editing (left/right arrows)
- backspace/delete support
- command history (up/down)
- scroll mode when not typing
- preventDefault for arrow keys

Rules:
- Do NOT modify engine core
- Keep combo keys unchanged
- Keep logic isolated to this file only

Validation:
- arrows move cursor
- backspace/delete works
- history works
- scroll works
- no browser scrolling
