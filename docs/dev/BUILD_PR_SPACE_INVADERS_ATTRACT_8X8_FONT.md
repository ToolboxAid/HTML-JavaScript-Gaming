Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_SPACE_INVADERS_ATTRACT_8X8_FONT.md

# BUILD_PR — Space Invaders Attract Mode and 8x8 Font Pass

## Goal
Add attract-mode support to Space Invaders using the reusable AttractModeController and render attract/menu/UI text with the 8x8 font to better match classic arcade presentation.

## Scope
- integrate `engine/scenes/AttractModeController.js` into Space Invaders
- use engine-default attract timing/readability behavior
- add Space Invaders attract content:
  - title
  - score advance table
  - start prompt
  - optional demo loop if current game structure supports it cleanly
- render attract/menu/UI text with the 8x8 font
- keep gameplay rules unchanged

## Attract Content Targets
### Title Phase
- SPACE INVADERS title treatment
- PRESS 1 OR 2 TO START
- clean separation from active gameplay

### Score Table / Legend Phase
- SCORE ADVANCE TABLE
- UFO / mystery ship score legend
- alien row value display
- readable layout using 8x8 font

### Demo Phase
- optional demo loop or deterministic idle presentation
- immediate exit on gameplay input
- no overlap with normal menu rendering

## 8x8 Font Targets
Use 8x8 font for:
- title text
- start prompt
- score table text
- game over
- high score / initials if already present or added later

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if actually imported and used)
- bitmap/font helper or shared text renderer only if actually imported and used

## Engine Boundary Rules
- keep Space Invaders attract layouts in the game layer
- do not put Space Invaders-specific text or UI into engine
- do not make AttractModeController know about bitmap fonts
- only include engine files in the delta if this PR actually modifies them

## Reuse Targets
- /engine/scenes/AttractModeController.js
- engine default attract timing/readability behavior
- existing 8x8 font rendering path if already available

## Non-Goals
- no gameplay rule changes
- no collision/physics changes
- no unrelated UI framework work
- no engine-level font system redesign in this pass

## Acceptance Criteria
- Space Invaders enters attract mode cleanly on idle
- attract exits immediately on gameplay input
- title/legend/start text render in 8x8 font
- no menu/attract overlap
- readability is strong
- gameplay behavior remains unchanged
- no console errors
- tests updated and passing

## Commit Comment
Add Space Invaders attract mode and 8x8 font UI presentation

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_SPACE_INVADERS_ATTRACT_8X8_FONT
