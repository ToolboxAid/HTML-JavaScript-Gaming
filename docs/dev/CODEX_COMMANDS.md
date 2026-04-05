MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Add TAB autocomplete to dev console.

Modify:
tools/dev/devConsoleIntegration.js

Requirements:
- Tab triggers autocomplete
- Autocomplete uses command registry (if available)
- If multiple matches → cycle suggestions
- If one match → complete command
- Do not break existing input/cursor logic
- Prevent default tab behavior

Behavior:
- Partial input "sce" → Tab → "scene."
- "scene.r" → Tab → "scene.reload"
- Multiple matches → cycle each Tab press

Constraints:
- No engine core changes
- Keep logic isolated to this file
- Preserve combo keys

Validation:
- Tab completes commands
- No browser focus change
- Cursor remains correct
