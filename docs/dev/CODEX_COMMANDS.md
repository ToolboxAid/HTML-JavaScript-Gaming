Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Update dev console integration to replace F-key bindings with combo-key bindings.

- Shift + ` => toggleConsole
- Ctrl + Shift + ` => toggleOverlay
- Ctrl + Shift + R => reload
- Ctrl + Shift + ] => next panel
- Ctrl + Shift + [ => previous panel

Remove all F-key bindings.

Keep changes isolated to devConsoleIntegration.js
Do not modify engine core
