MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Implement command pack system.

- Create registry: tools/dev/devConsoleCommandRegistry.js
- Create command packs under tools/dev/commandPacks/
- Update devConsoleIntegration.js to use registry
- Implement help system
- Use standardized output format
- Do NOT modify engine core
- Keep combo keys unchanged
- Package result to:
  <project>/tmp/PLAN_BUILD_PR_DEV_CONSOLE_COMMAND_PACKS_delta.zip

Report:
- files created
- files updated
- commands implemented
