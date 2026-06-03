Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_INTERACTIVE_DEV_CONSOLE_UI.md

# PLAN PR
Interactive Dev Console UI

## Objective
Plan a sample-safe interactive on-screen developer console UI that builds on the existing dev console runtime,
combo-key system, and canvas debug HUD so commands can be typed and executed directly inside the running sample.

## Scope
- Add an interactive console UI layer above the existing runtime
- Support text input, command submission, output history, and simple focus behavior
- Reuse the current command execution pipeline
- Keep implementation isolated to tools/dev and one sample integration target
- Preserve engine core boundaries and current debug controls

## Non-Goals
- No engine core rewrite
- No DOM-only console dependency
- No full editor framework
- No autocomplete requirement in this PR
- No multi-sample rollout

## Existing Foundation
Already in place:
- dev console runtime
- combo-key debug controls
- canvas HUD renderer
- sample-level integration path

## Planned Behavior
- Shift + ` toggles console UI visibility
- Ctrl + Shift + ` toggles HUD visibility
- Console accepts typed input while open
- Enter submits a command
- Escape closes the console UI
- Up/Down browse recent command history
- Output is rendered in a visible console region on-canvas
- Existing runtime commands are reused, not reimplemented

## Candidate Files
Expected future implementation focus:
- tools/dev/interactiveDevConsoleRenderer.js
- tools/dev/devConsoleIntegration.js
- one sample entry file only
- optional test file for input/history behavior

## UI Requirements
- On-canvas console surface
- Fixed anchor, default bottom-left or top-left
- Separate input line from output history
- Readable font and padding
- Transparent/dim background
- Safe clipping for long output
- Max visible history window
- Distinct prompt marker
- Non-destructive when closed

## Input Requirements
- Capture character input only while console is open
- Do not interfere with sample controls while closed
- Backspace edits current line
- Enter executes command
- Escape closes console
- Up/Down cycle command history
- Tab reserved for future autocomplete; no required behavior now

## Integration Rules
- Reuse existing runtime executeConsoleInput()
- Reuse current combo-key bindings already implemented
- Do not spread input handling into engine core
- Do not duplicate command registry
- Keep console rendering after world render
- Keep HUD and console rendering coordinated but separate

## Acceptance Criteria
- Console opens and closes reliably
- Typed characters appear on screen
- Enter executes commands
- Output history is visible
- Up/Down history navigation works
- Escape closes without crashing
- Sample still runs normally
- No F-key bindings reintroduced
- No engine core file changes

## Validation
- node --check on touched JS files
- manual browser run
- verify console typing
- verify command execution for:
  - help
  - status
  - scene.info
- verify invalid command output is shown safely
- verify console input does not remain captured after close

## Risks
- key handling collisions with gameplay input
- text rendering overflow
- duplicate listener setup
- runtime/UI state drift

## Deliverable
Create BUILD_PR_INTERACTIVE_DEV_CONSOLE_UI as a docs-only, repo-structured delta.
