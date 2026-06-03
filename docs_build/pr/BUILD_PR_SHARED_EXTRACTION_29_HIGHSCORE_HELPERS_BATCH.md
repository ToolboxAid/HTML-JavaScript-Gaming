# BUILD_PR_SHARED_EXTRACTION_29_HIGHSCORE_HELPERS_BATCH

## Purpose
Centralize duplicated high score helper functions across game implementations into a shared game utility.

## Single PR Purpose
Normalize ONLY these helpers:

- sanitizeScore(value)
- sanitizeInitials(value)
- sanitizeRow(row)
- sortRows(rows)

Target files:

1. games/Asteroids/systems/AsteroidsHighScoreService.js
2. games/SpaceDuel/game/SpaceDuelHighScoreService.js
3. games/SpaceInvaders/game/SpaceInvadersHighScoreService.js

## Exact Files Allowed

### New shared file (allowed in this PR)
1. src/shared/utils/highScoreUtils.js

### Consumers
2. games/Asteroids/systems/AsteroidsHighScoreService.js
3. games/SpaceDuel/game/SpaceDuelHighScoreService.js
4. games/SpaceInvaders/game/SpaceInvadersHighScoreService.js

## Shared Helper Creation
Create:
src/shared/utils/highScoreUtils.js

Export exactly:
- sanitizeScore
- sanitizeInitials
- sanitizeRow
- sortRows

Use ONE of the existing implementations as source-of-truth.
Do NOT merge logic.
Do NOT change behavior.

## Consumer Changes

For each consumer file:
- remove local helper implementations for the 4 functions
- import from src/shared/utils/highScoreUtils.js
- keep all logic intact

## Constraints
- no engine changes
- no other helpers
- no behavior change
- exact batch only

## Validation
- helpers exist only in shared file
- consumers import correctly
- behavior unchanged

## Non-Goals
- no other score systems
- no UI changes
