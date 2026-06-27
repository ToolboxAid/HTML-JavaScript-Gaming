# BUILD_PR_LEVEL_11_1_AUTHORITATIVE_STATE_HANDOFF_CANDIDATE

## Purpose
Implement the Level 11.1 authoritative state handoff candidate with the smallest possible surgical scope. Keep the work limited to authoritative-state transition validation and targeted test coverage needed for this PR purpose.

## Scope
Primary target files:
- `src/advanced/state/transitions.js`
- `tests/world/WorldGameStateAuthoritativeHandoff.test.mjs`

Allowed nearby reads:
- `src/advanced/state/*`
- `tests/world/*Authoritative*.mjs`

## Required implementation
Add strict validation for `updateObjectiveProgress` transition payloads:
- reject non-numeric `currentValue` when provided
- reject non-numeric `targetValue` when provided
- reject non-boolean `isComplete` when provided

Add targeted test coverage proving invalid objective progress payloads are rejected in the authoritative handoff flow:
- request `updateObjectiveProgress` with invalid payload
- assert rejection is returned
- assert rejection code is `INVALID_PAYLOAD`
- assert rejection event type is `WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_REJECTED`
- assert no invalid objective snapshot is stored

## Acceptance criteria
- invalid `updateObjectiveProgress` payloads are rejected deterministically
- no new engine/game coupling is introduced
- no unrelated state transitions are changed
- no unrelated tests are edited
- passive and authoritative modes continue to coexist without regression

## Validation
Run only:
- `node tests/world/WorldGameStateAuthoritativeHandoff.test.mjs`
- `node tests/world/WorldGameStateAuthoritativeScore.test.mjs`
- `node --check src/advanced/state/transitions.js`

## Non-goals
- no repo-wide cleanup
- no roadmap wording changes
- no script/tooling changes
- no start_of_day changes
- no broad refactor
- no engine core API redesign

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped implementation files for this PR purpose.
