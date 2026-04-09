# BUILD PR — Games Template Index Canvas Fix

## Purpose
Fix games/_template/index.html to render required message on canvas.

## Scope (STRICT)
- Modify ONLY:
  games/_template/index.html

## Required Behavior
- Render a canvas
- Draw text ON canvas:

  Game Template
  Replace this entrypoint with your game-specific shell.

- No DOM text fallback
- No game logic
- No asset loading

## Explicit Non-Goals
- DO NOT modify any other file
- DO NOT add new files
- DO NOT introduce engine usage
- DO NOT load Asteroids or any game code

## Fail-Fast
- If change requires more than index.html → STOP

## Acceptance Criteria
- Canvas visible
- Text drawn on canvas
- No console errors
- No game loop runs

## Validation
1. Open games/_template/index.html
2. Confirm canvas renders
3. Confirm text appears on canvas
4. Confirm no game behavior

## Output
<project folder>/tmp/BUILD_PR_GAMES_TEMPLATE_INDEX_CANVAS_FIX_delta.zip
