Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_SAMPLE_GAME_DEV_CONSOLE_TOGGLE_INTEGRATION.md

# BUILD PR
Dev Console + Debug Overlay Sample Integration

## Implementation Steps (Codex)

1. Create file:
tools/dev/devConsoleIntegration.js

2. Implement:
- import runtime from tools/shared/devConsoleDebugOverlay.js
- key handling:
  ` → toggleConsole()
  Shift + ` → toggleOverlay()
- expose:
  init, dispose, updateDiagnostics, renderOverlay, executeCommand, getState

3. Modify ONE sample file:
- import integration
- initialize once
- call updateDiagnostics() in loop
- call renderOverlay() after render

## Constraints
- no engine core changes
- no duplicate runtime logic
- sample-level only
- overlay renders last

## Validation
- ` toggles console
- Shift + ` toggles overlay
- no crashes
- sample still runs
