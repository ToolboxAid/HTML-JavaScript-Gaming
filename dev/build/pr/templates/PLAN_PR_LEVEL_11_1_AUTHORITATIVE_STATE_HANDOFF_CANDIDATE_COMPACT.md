# PLAN_PR_LEVEL_11_1_AUTHORITATIVE_STATE_HANDOFF_CANDIDATE

## Purpose
Implement the Level 11.1 authoritative state handoff candidate with the smallest possible surgical scope. Keep the work limited to authoritative-state transition validation and targeted test coverage.

## Scope
Primary target files:
- src/advanced/state/transitions.js
- tests/world/WorldGameStateAuthoritativeHandoff.test.mjs

Allowed nearby reads:
- src/advanced/state/*
- tests/world/*Authoritative*.mjs

## Required changes
- Add strict validation for updateObjectiveProgress payloads
- Reject non-numeric currentValue when provided
- Reject non-numeric targetValue when provided
- Reject non-boolean isComplete when provided
- Add targeted test coverage proving invalid payloads are rejected
- Assert INVALID_PAYLOAD rejection
- Assert TRANSITION_REJECTED event type
- Assert no invalid objective snapshot is stored

## Acceptance criteria
- Invalid updateObjectiveProgress payloads are rejected deterministically
- No new engine/game coupling is introduced
- No unrelated transitions or tests are changed
- Passive and authoritative modes continue to coexist without regression

## Validation
Run only:
- node tests/world/WorldGameStateAuthoritativeHandoff.test.mjs
- node tests/world/WorldGameStateAuthoritativeScore.test.mjs
- node --check src/advanced/state/transitions.js

## Non-goals
- no repo-wide cleanup
- no roadmap wording changes
- no script/tooling changes
- no start_of_day changes
- no broad refactor
- no engine core API redesign

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped implementation files for this PR purpose.
