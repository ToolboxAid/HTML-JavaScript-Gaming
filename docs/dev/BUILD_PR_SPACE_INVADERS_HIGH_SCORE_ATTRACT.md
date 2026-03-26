Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_SPACE_INVADERS_HIGH_SCORE_ATTRACT.md

# BUILD_PR — Space Invaders High Score Persistence, Initials Entry, and Attract High Scores

## Goal
Add persistent high scores, qualifying-score initials entry, and attract-mode high-score display to Space Invaders while preserving validated gameplay behavior and the 8x8-font arcade presentation.

## Scope
- add Space Invaders high-score persistence
- add deterministic 3-letter initials entry for qualifying scores
- render saved high scores during attract mode
- keep 8x8 font for title, high-score, and start text
- preserve existing gameplay rules, wave flow, scoring rules, and attract timing behavior

## Features

### High Score Persistence
- load saved Space Invaders high-score table on boot or scene init
- save updated table when a qualifying run finishes
- seed a clean default table when storage is empty
- keep storage keys game-specific and stable
- keep top score synced for HUD and attract use

### Initials Entry
- when a score qualifies, enter initials-entry mode
- support simple arcade-style 3-letter initials entry
- keyboard-first controls
- deterministic input flow that is easy to test
- return cleanly to menu/attract flow after save

### Attract High Score Phase
- render saved score rows in attract mode
- keep attract text in 8x8 font
- preserve strong readability with no menu/attract overlap
- allow immediate attract exit on gameplay input

## Suggested Files
- /games/SpaceInvaders/game/SpaceInvadersHighScoreService.js
- /games/SpaceInvaders/game/SpaceInvadersInitialsEntry.js
- /games/SpaceInvaders/game/SpaceInvadersAttractAdapter.js
- /games/SpaceInvaders/game/SpaceInvadersScene.js
- /tests/games/SpaceInvadersHighScorePersistence.test.mjs
- update /tests/run-tests.mjs if needed

## Reuse Targets
- /engine/scenes/AttractModeController.js
- Space Duel high-score persistence pattern
- actual-import-only engine class listing discipline
- existing 8x8 font rendering path

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if actually imported and used)
- persistence / WorldSerializer (only if actually imported and used)
- bitmap/font helper or shared text renderer only if actually imported and used

## Engine Boundary Rules
- do not add Space Invaders-specific score-table or initials rules to engine
- use engine persistence only through existing public contracts if already present
- keep initials-entry and attract high-score presentation in the game layer
- only include engine files in the delta if this PR actually modifies them

## Non-Goals
- no gameplay rule changes
- no collision/physics changes
- no attract controller redesign
- no unrelated UI framework work

## Acceptance Criteria
- qualifying score triggers initials entry
- initials can be entered and saved cleanly
- saved high scores appear in attract mode
- attract text remains in 8x8 font
- no menu/attract overlap
- no console errors
- gameplay behavior remains unchanged
- tests updated and passing

## Commit Comment
Add Space Invaders high score persistence, initials entry, and attract high score display

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_SPACE_INVADERS_HIGH_SCORE_ATTRACT
