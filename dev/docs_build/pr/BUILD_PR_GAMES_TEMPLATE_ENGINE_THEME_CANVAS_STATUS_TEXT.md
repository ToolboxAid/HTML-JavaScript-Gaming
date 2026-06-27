# BUILD PR — Games Template Engine Theme Canvas Status Text

## Purpose
Keep the minimal shared engine/theme bootstrap for `games/_template`, but require the status messaging to render on the canvas instead of as HTML text.

## Problem Statement
The template needs the standard shell/theme baseline, but the visible status should be canvas-rendered so the entrypoint behaves like a proper game shell.

## Source Of Truth
Use `games/Asteroids/index.html` only as the shell/theme/bootstrap reference.

Do NOT copy gameplay behavior.

## Scope (STRICT)
- Modify `games/_template/index.html`
- Modify only the direct minimal shell/bootstrap wiring needed to support canvas-rendered status text
- Keep `_template` non-playable and game-neutral

## Target Files (EXACT)
Primary target:
- `games/_template/index.html`

Secondary allowed edits/additions:
- only minimal direct shell/theme/bootstrap files already used by the canonical game shell, if required to preserve consistent view
- no gameplay files
- no assets
- no entities, flow, levels, or rules

## Required Behavior
`games/_template/index.html` MUST:
- show the standard shell/theme baseline used by the canonical game shell
- render a visible canvas
- render the following text ON THE CANVAS, not as DOM/HTML status text:

  HTML Says
  Template Status
  This template intentionally does not boot gameplay.

- not auto-boot gameplay
- not load Asteroids-specific game logic
- not depend on Asteroids-specific assets

## Allowed Operations
- update `_template/index.html`
- replace HTML status text with canvas-drawn status text
- keep minimal shell/bootstrap/theme alignment
- add only minimal direct non-game-specific support files if strictly required

## Explicit Non-Goals
- DO NOT modify `games/Asteroids`
- DO NOT copy Asteroids gameplay
- DO NOT copy Asteroids assets
- DO NOT add a new theming system
- DO NOT expand beyond template shell/bootstrap alignment
- DO NOT leave the required status text as plain HTML text

## Fail-Fast Conditions
STOP with no changes if any of the following are true:
- rendering the required text on canvas would require gameplay boot code
- preserving the canonical shell/theme baseline would require copying Asteroids-specific gameplay files
- more than minimal shell/bootstrap edits are required
- any path outside the template shell/bootstrap scope must be changed

## Acceptance Criteria
- `games/_template/index.html` shows the consistent shell/theme baseline
- canvas is visible
- the following text appears on the canvas:
  - `HTML Says`
  - `Template Status`
  - `This template intentionally does not boot gameplay.`
- the same text is not relied on as HTML body content
- no gameplay starts
- no Asteroids-specific code or assets are copied into `_template`
- no console errors

## Validation Steps
1. Open `games/_template/index.html`
2. Confirm the canonical shell/theme baseline is present
3. Confirm a visible canvas is present
4. Confirm the required three lines render on the canvas
5. Confirm no gameplay starts
6. Confirm no console errors

## Output Requirement
Codex must package:
`<project folder>/tmp/BUILD_PR_GAMES_TEMPLATE_ENGINE_THEME_CANVAS_STATUS_TEXT_delta.zip`
