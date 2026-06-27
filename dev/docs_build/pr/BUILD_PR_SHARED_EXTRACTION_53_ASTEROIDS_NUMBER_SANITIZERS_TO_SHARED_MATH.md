# BUILD PR — Move Asteroids number sanitizers into shared math

## Purpose
Normalize Asteroids-local numeric sanitizers into the canonical numeric home.

## Exact Target Files
- `src/shared/math/numberNormalization.js`
- `games/Asteroids/game/AsteroidsWorld.js`

## Required Code Changes
1. In `src/shared/math/numberNormalization.js`
   - add/export exact-behavior shared equivalents for:
     - Asteroids finite-number sanitizer
     - Asteroids positive-number sanitizer
   - preserve current Asteroids runtime behavior exactly

2. In `games/Asteroids/game/AsteroidsWorld.js`
   - stop defining the local number sanitizer helpers
   - import the new shared math helper(s)
   - preserve all existing call-site behavior

## Hard Constraints
- exact files only
- do not touch any non-number helper in `AsteroidsWorld.js`
- do not modify other Asteroids files
- do not modify `src/shared/utils/numberUtils.js` in this PR
- do not refactor unrelated gameplay/state logic
- preserve behavior exactly; this is extraction, not semantic change

## Acceptance Criteria
- Asteroids number sanitizers live in `src/shared/math/numberNormalization.js`
- `games/Asteroids/game/AsteroidsWorld.js` uses shared math imports instead of local helper definitions
- no local duplicate sanitizer implementation remains in `AsteroidsWorld.js`
- no gameplay behavior change
