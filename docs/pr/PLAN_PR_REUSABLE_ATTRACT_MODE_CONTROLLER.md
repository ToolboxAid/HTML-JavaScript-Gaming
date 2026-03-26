Toolbox Aid
David Quesenberry
03/25/2026
PLAN_PR_REUSABLE_ATTRACT_MODE_CONTROLLER.md

# PLAN_PR — Reusable AttractModeController

## Goal
Create a reusable attract mode controller in engine with game-local adapters so arcade games can support idle-driven title/high-score/demo loops without polluting engine with game-specific logic.

## Scope
- add a reusable `AttractModeController` in engine
- keep the controller responsible only for:
  - idle timeout
  - attract-mode entry
  - phase timing
  - demo start/stop hooks
  - exit on input
- keep all game-specific behavior in per-game adapters
- define a clean pattern that Space Duel and future arcade games can reuse

## Proposed Files
- /engine/scenes/AttractModeController.js
- /games/SpaceDuel/game/SpaceDuelAttractAdapter.js
- /games/SpaceInvaders/game/SpaceInvadersAttractAdapter.js (optional later)
- /docs/dev/PLAN_PR_REUSABLE_ATTRACT_MODE_CONTROLLER.md
- /tests/scenes/AttractModeController.test.mjs

## Engine Responsibilities
The reusable controller should manage:
- idle time tracking
- attract mode active/inactive state
- phase sequencing
- calling supplied hooks
- exiting attract mode on any gameplay input

## Suggested Phases
- title
- highScores
- demo

## Game Adapter Responsibilities
Each game adapter should define:
- enter()
- exit()
- setPhase(phase)
- startDemo()
- stopDemo()
- update(dt)
- render(renderer)

## API Shape
Recommended controller construction:

```js
new AttractModeController({
  idleTimeoutMs: 12000,
  phaseDurationMs: 7000,
  isInputActive: () => inputActive,
  onEnterAttract: () => adapter.enter(),
  onExitAttract: () => adapter.exit(),
  onEnterDemo: () => adapter.startDemo(),
  onExitDemo: () => adapter.stopDemo(),
  onPhaseChange: (phase) => adapter.setPhase(phase),
  phases: ['title', 'highScores', 'demo'],
  nowMs: () => performance.now(),
})
```

## State Contract
- `active`: attract mode on/off
- `phase`: one of `title | highScores | demo`
- `idleMs`: current idle time
- transitions:
  - idle timeout reached -> enter attract at `title`
  - phase duration reached -> advance to next phase
  - any input while active -> exit attract immediately

## Engine Boundary Rules
- engine owns only the reusable attract-mode state machine
- engine must not know Space Duel, Space Invaders, or any game rules
- game title screens, high-score formatting, demo behavior, and reset rules remain in the game layer
- only move shared behavior into engine if it is truly reusable across games

## Demo Strategy
Preferred first implementation:
- use simple bot/demo behavior per game
- optionally add reusable input playback later if multiple games need it

## Non-Goals
- no giant UI/menu framework
- no game-specific title rendering in engine
- no gameplay rule changes
- no persistence changes in this PR unless explicitly needed later
- no engine-wide scene-manager rewrite

## Test Plan
- unit tests for controller timing and phase transitions
- unit tests for input-driven exit behavior
- adapter smoke test in Space Duel title/menu flow
- verify no regressions in existing game test suite

## Acceptance Criteria
- attract mode enters after idle timeout
- attract mode exits on input
- phases cycle cleanly
- demo can start and stop through adapter hooks
- controller is reusable across multiple games
- no game-specific logic is embedded in engine
- no console errors
- no architecture rule violations

## Commit Comment
Plan reusable AttractModeController with engine state machine and game-local adapters

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: PLAN_PR_REUSABLE_ATTRACT_MODE_CONTROLLER
