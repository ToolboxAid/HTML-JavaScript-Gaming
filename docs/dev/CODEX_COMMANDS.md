Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_CANVAS_DEBUG_OVERLAY_RENDERER implementation.

Requirements:
- Create tools/dev/canvasDebugHudRenderer.js
- Update tools/dev/devConsoleIntegration.js to use the HUD renderer
- Modify ONE sample/dev entry file only
- Draw debug HUD on canvas after world rendering
- Keep combo keys exactly as currently implemented:
  - Shift + ` => toggle console
  - Ctrl + Shift + ` => toggle overlay
  - Ctrl + Shift + R => reload
  - Ctrl + Shift + ] => next panel
  - Ctrl + Shift + [ => previous panel
- No engine core changes
- No F-key bindings
- Use save()/restore() around canvas mutations
- Keep commit_comment.txt header-free
- Run node --check on touched JS files
- Package implementation output to:
  <project folder>/tmp/BUILD_PR_CANVAS_DEBUG_OVERLAY_RENDERER_delta.zip

Report back:
- exact files changed
- sample file selected
- how HUD draw is invoked
- validation command results
