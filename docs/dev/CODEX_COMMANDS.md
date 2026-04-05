Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Apply the canvas debug HUD renderer implementation.

Requirements:
- Keep changes isolated to:
  - tools/dev/canvasDebugHudRenderer.js
  - tools/dev/devConsoleIntegration.js
  - one sample entry file only
- Do not modify engine core
- Draw HUD last on canvas
- Preserve combo-key bindings exactly
- Use canvas save()/restore()
- Run node --check on touched JS files
- Package result to:
  <project folder>/tmp/APPLY_PR_CANVAS_DEBUG_OVERLAY_RENDERER_delta.zip

Report back:
- exact files changed
- selected sample file
- how HUD draw is invoked
- validation results
