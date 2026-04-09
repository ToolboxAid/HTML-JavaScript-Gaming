# BUILD PR — Asteroids New Flatten Duplicate Subfolders

## Purpose
Fix the incorrectly duplicated nested directories created during the full-copy burst so `games/asteroids_new` uses the intended template-aligned structure and remains testable.

## Exact Target Files

### Files currently in correct root-level folders (must remain)
- `games/asteroids_new/assets/Asteroids Deluxe.png`
- `games/asteroids_new/assets/asteroids-bezel.png`
- `games/asteroids_new/assets/bangLarge.wav`
- `games/asteroids_new/assets/bangMedium.wav`
- `games/asteroids_new/assets/bangSmall.wav`
- `games/asteroids_new/assets/beat1.wav`
- `games/asteroids_new/assets/beat2.wav`
- `games/asteroids_new/assets/extraShip.wav`
- `games/asteroids_new/assets/fire.wav`
- `games/asteroids_new/assets/preview.png`
- `games/asteroids_new/assets/saucerBig.wav`
- `games/asteroids_new/assets/saucerSmall.wav`
- `games/asteroids_new/assets/thrust.wav`
- `games/asteroids_new/assets/vector_battle.ttf`
- `games/asteroids_new/debug/asteroidsShowcaseDebug.js`
- `games/asteroids_new/entities/Asteroid.js`
- `games/asteroids_new/entities/Bullet.js`
- `games/asteroids_new/entities/Ship.js`
- `games/asteroids_new/entities/Ufo.js`
- `games/asteroids_new/game/AsteroidsAttractAdapter.js`
- `games/asteroids_new/game/AsteroidsGameScene.js`
- `games/asteroids_new/game/AsteroidsSession.js`
- `games/asteroids_new/game/AsteroidsWorld.js`
- `games/asteroids_new/systems/AsteroidsAudio.js`
- `games/asteroids_new/systems/AsteroidsHighScoreService.js`
- `games/asteroids_new/systems/AsteroidsInitialsEntry.js`
- `games/asteroids_new/systems/HighScoreStore.js`
- `games/asteroids_new/systems/ShipDebrisSystem.js`

### Incorrect duplicate nested folders/files to remove
- `games/asteroids_new/assets/assets/*`
- `games/asteroids_new/debug/debug/*`
- `games/asteroids_new/entities/entities/*`
- `games/asteroids_new/game/game/*`
- `games/asteroids_new/systems/systems/*`

## Required Code Changes
1. Verify the root-level copies listed above are present and intact.
2. Remove the duplicate nested folders and their duplicate contents:
   - `assets/assets`
   - `debug/debug`
   - `entities/entities`
   - `game/game`
   - `systems/systems`
3. Do not move, rename, or modify the correct root-level copies.
4. Do not modify unrelated folders such as:
   - `config`
   - `flow`
   - `levels`
   - `platform`
   - `ui`
   - `utils`

## Hard Constraints
- exact scope only
- do not touch original `games/Asteroids/*`
- do not change file contents in the correct root-level copies
- do not widen into import refactors unless removal of duplicate nested paths requires a minimum fix in an already-listed `games/asteroids_new` file
- no repo-wide cleanup
- no formatting-only churn

## Validation Steps
- confirm the duplicate nested folders no longer exist
- confirm the root-level copies still exist
- confirm `games/asteroids_new` still parses/imports cleanly after duplicate-folder removal
- confirm no original `games/Asteroids/*` files changed

## Acceptance Criteria
- `games/asteroids_new` has one intended copy of each file in the correct folder
- no `assets/assets`, `debug/debug`, `entities/entities`, `game/game`, or `systems/systems` folders remain
- the parallel lane remains smoke-testable
