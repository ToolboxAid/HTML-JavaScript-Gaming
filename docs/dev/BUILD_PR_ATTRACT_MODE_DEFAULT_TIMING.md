Toolbox Aid
David Quesenberry
03/25/2026

# BUILD_PR — AttractModeController Default Timing and Readability Update

## Goal
Move attract-mode timing/readability improvements into the engine so all current and future games benefit without per-game fixes.

## Scope
- update default timing inside AttractModeController
- reduce phase duration
- shorten fade-in and fade-out windows
- bias toward fast readability and minimal overlap
- provide timing state helper for adapters

## New Defaults
- phaseDurationMs: 4600
- fadeInMs: 220
- fadeOutMs: 220
- idleTimeoutMs: unchanged (or confirm existing default)

## Implementation Notes
- define DEFAULT_ATTRACT_CONFIG in:
  /engine/scenes/AttractModeController.js
- apply defaults unless overridden by game config
- add helper:
  getPhaseTimingState()

## Behavior Goals
- one dominant phase at a time
- minimal text overlap
- fast readable transitions
- immediate exit on input

## Engine Boundary Rules
- no game-specific logic added
- backward compatible for existing overrides
- no gameplay logic changes

## Non-Goals
- no attract content/layout changes
- no rendering system changes
- no scene logic refactor

## Acceptance Criteria
- Space Duel and Asteroids no longer require local timing fixes
- transitions are visibly faster and clearer
- no regressions
- all tests pass

## Commit Comment
Improve AttractModeController defaults for faster transitions and better readability

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_ATTRACT_MODE_DEFAULT_TIMING
