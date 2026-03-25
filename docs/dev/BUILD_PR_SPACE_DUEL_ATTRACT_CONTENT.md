Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_SPACE_DUEL_ATTRACT_CONTENT.md

# BUILD_PR — Space Duel Attract Content Pass

## Goal
Use the reusable AttractModeController to build real Space Duel attract-mode content so the game presents more like an arcade cabinet when idle.

## Scope
- build real title-screen attract content for Space Duel
- build real high-score attract content for Space Duel
- build real demo attract behavior for Space Duel
- polish transitions between title, highScores, and demo phases
- optionally add blinking PRESS START style messaging
- keep gameplay rules unchanged outside attract behavior
- keep all Space Duel-specific attract content in the game layer

## Attract Content Targets
### Title Phase
- Space Duel title treatment
- player/start messaging
- optional blinking start prompt
- clear visual separation from active gameplay

### High Score Phase
- display current high-score table or placeholder structure if final score persistence is not yet complete
- readable layout on black/vector-style background
- consistent timing with other attract phases

### Demo Phase
- show demo behavior using the existing attract adapter
- ensure demo begins and exits cleanly
- ensure input exits attract immediately and returns control cleanly
- keep demo behavior deterministic enough to look intentional

## Integration Rules
- continue using engine/scenes/AttractModeController.js
- keep scene orchestration thin
- keep title/high-score/demo rendering logic in Space Duel adapter or game-local helpers
- do not move Space Duel-specific attract presentation into engine

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if currently imported and used by the game page)

## Non-Goals
- no new physics tuning in this pass
- no scoring rule changes in this pass
- no core gameplay changes in this pass
- no generic engine UI framework in this pass

## Acceptance Criteria
- idle in menu enters attract mode cleanly
- title phase renders clearly
- high-score phase renders clearly
- demo phase runs and exits cleanly
- any gameplay input exits attract immediately
- transitions feel intentional and not abrupt
- no console errors
- no architecture rule violations

## Commit Comment
Build Space Duel attract content, demo flow, and title screen polish

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_SPACE_DUEL_ATTRACT_CONTENT
