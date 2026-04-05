Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_INTERACTIVE_DEV_CONSOLE_UI.md

# BUILD PR
Interactive Dev Console UI

## Objective
Build an on-canvas interactive developer console UI on top of the existing dev console runtime, combo-key controls,
and canvas HUD so commands can be typed and executed directly in one running sample.

## Implementation Scope
- Create a dedicated interactive console renderer/input state module
- Update the existing sample-level dev console integration to support typed input
- Modify one sample entry file only
- Keep engine core untouched
- Reuse existing runtime command execution pipeline

## Required Output
Codex must produce implementation code and package:
<project folder>/tmp/BUILD_PR_INTERACTIVE_DEV_CONSOLE_UI_delta.zip

## Target Files
Expected implementation focus:
- tools/dev/interactiveDevConsoleRenderer.js
- tools/dev/devConsoleIntegration.js
- one sample entry file only
- optional test file if needed

## Implementation Requirements

### 1. New interactive console renderer
Create:
tools/dev/interactiveDevConsoleRenderer.js

Responsibilities:
- render a console surface on canvas
- render input prompt + current input buffer
- render visible output history window
- render command history cursor state when navigating
- clip safely when output exceeds visible area
- tolerate empty history and empty input safely
- remain dependency-free

### 2. Update dev console integration
Update:
tools/dev/devConsoleIntegration.js

Requirements:
- preserve existing combo keys:
  - Shift + ` => toggle console
  - Ctrl + Shift + ` => toggle overlay
  - Ctrl + Shift + R => reload
  - Ctrl + Shift + ] => next panel
  - Ctrl + Shift + [ => previous panel
- when console is open:
  - capture printable character input
  - Backspace edits current buffer
  - Enter executes command through existing runtime
  - Escape closes console
  - ArrowUp browses older commands
  - ArrowDown browses newer commands
- when console is closed:
  - do not capture gameplay typing
- expose a drawConsole(ctx, state) method
- keep HUD and console draw paths separate but coordinated

### 3. Sample wiring
Modify ONE sample entry file only.

Requirements:
- initialize integration once
- update diagnostics in the loop
- draw world first
- draw HUD last when enabled
- draw console surface when enabled
- prevent duplicate listeners/runtime instances across reinit or reload

## UI Rules
- on-canvas only
- no DOM dependency required
- readable font, padding, and translucent background
- visible prompt marker
- bounded history size
- safe line wrapping or truncation strategy
- save()/restore() around canvas state changes

## Minimum Commands to Validate
- help
- status
- scene.info

## Acceptance Criteria
- console opens and closes reliably
- typed text appears on canvas
- Enter executes commands
- output history is visible
- ArrowUp/ArrowDown history navigation works
- Escape closes cleanly
- sample still runs normally
- no F-key bindings reintroduced
- no engine core files modified

## Validation
- node --check on all touched JS files
- manual browser run
- verify text input
- verify command output
- verify invalid command output is shown safely
- verify input stops being captured after close
- verify no duplicate listeners after repeated toggles/reloads

## Rollback
If instability appears:
- disable console surface rendering
- preserve runtime and HUD behavior
- keep combo-key control path intact
