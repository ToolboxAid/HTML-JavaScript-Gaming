Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_INTERACTIVE_DEV_CONSOLE_UI implementation.

Requirements:
- Create tools/dev/interactiveDevConsoleRenderer.js
- Update tools/dev/devConsoleIntegration.js
- Modify ONE sample entry file only
- Reuse existing runtime executeConsoleInput()
- Preserve combo keys exactly:
  - Shift + ` => toggle console
  - Ctrl + Shift + ` => toggle overlay
  - Ctrl + Shift + R => reload
  - Ctrl + Shift + ] => next panel
  - Ctrl + Shift + [ => previous panel
- Add typed console input behavior only while console is open
- Draw console on canvas
- Do not modify engine core
- No F-key bindings
- Use save()/restore() around canvas changes
- Keep commit_comment.txt header-free
- Run node --check on touched JS files
- Package implementation output to:
  <project folder>/tmp/BUILD_PR_INTERACTIVE_DEV_CONSOLE_UI_delta.zip

Report back:
- exact files changed
- selected sample file
- how console input is captured
- how console draw is invoked
- validation command results
