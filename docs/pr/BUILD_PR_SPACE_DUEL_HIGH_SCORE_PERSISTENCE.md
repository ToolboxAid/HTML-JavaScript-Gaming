Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_SPACE_DUEL_HIGH_SCORE_PERSISTENCE.md

# BUILD_PR — Space Duel High Score Persistence Micro-PR

## Goal
Add persistent high-score storage and initials entry to Space Duel without changing core gameplay, physics, or attract controller behavior.

## Scope
- persist Space Duel high scores between sessions
- add initials-entry flow for qualifying scores
- connect attract-mode high-score phase to saved data
- keep the PR micro-scoped to score persistence and presentation only
- preserve existing validated gameplay and attract behavior

## Features

### High Score Persistence
- load saved high scores on game boot or scene init
- save updated high scores when a qualifying run finishes
- use existing engine persistence contract if already available
- keep storage keys game-specific and stable

### Initials Entry
- when a score qualifies, enter initials-entry mode
- support simple arcade-style three-letter initials entry
- allow keyboard-first input
- keep state flow deterministic and easy to test
- return cleanly to attract/title flow after save

### Attract Integration
- high-score attract screen must render saved scores, not placeholders
- if no saved data exists yet, seed a clean default table
- preserve existing title/high-score/demo phase sequencing

## Suggested Files
- /games/SpaceDuel/game/SpaceDuelHighScoreService.js
- /games/SpaceDuel/game/SpaceDuelInitialsEntry.js
- /games/SpaceDuel/game/SpaceDuelAttractAdapter.js (wire saved data)
- /games/SpaceDuel/game/SpaceDuelScene.js (qualifying-score flow only)
- /tests/games/SpaceDuelCore.test.mjs
- additional test file if useful for high-score persistence flow

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- persistence / WorldSerializer (only if actually imported and used)
- input / GamepadInputAdapter (only if currently imported and used by the game page)

## Engine Boundary Rules
- do not add Space Duel-specific score-table rules to engine
- use engine persistence only through existing public contracts
- keep initials-entry rules in the game layer
- no unrelated gameplay or visual overhaul changes in this PR

## Non-Goals
- no physics tuning
- no enemy behavior changes
- no attract controller changes
- no generic global high-score framework unless clearly reused immediately

## Acceptance Criteria
- qualifying score triggers initials entry
- initials can be entered and saved cleanly
- saved high scores appear in attract mode
- default table appears when no prior save exists
- no console errors
- no gameplay regressions
- tests updated and passing

## Commit Comment
Add Space Duel persistent high scores and initials entry micro-PR

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_SPACE_DUEL_HIGH_SCORE_PERSISTENCE
