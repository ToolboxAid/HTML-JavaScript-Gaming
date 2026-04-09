# BUILD PR — Asteroids New Flow And Debug Parallel Adoption

## Purpose
Accelerate `asteroids_new` by pulling over the first flow/debug shell needed to make the parallel lane look like a real game skeleton, while keeping the work non-destructive.

## Exact Target Files
Source:
- `games/Asteroids/debug/asteroidsShowcaseDebug.js`

Destination / touched:
- `games/asteroids_new/debug/asteroidsShowcaseDebug.js`
- `games/asteroids_new/flow/attract.js`
- `games/asteroids_new/flow/intro.js`
- `games/asteroids_new/index.js`

## Required Code Changes
1. Copy:
   - `games/Asteroids/debug/asteroidsShowcaseDebug.js`
   - to `games/asteroids_new/debug/asteroidsShowcaseDebug.js`

2. Update only the parallel flow files and index:
   - `games/asteroids_new/flow/attract.js`
   - `games/asteroids_new/flow/intro.js`
   - `games/asteroids_new/index.js`

3. The touched parallel files may be adjusted only as needed to reference the copied debug shell and current parallel lane structure.

## Hard Constraints
- exact files only
- copy only; do not move or delete the source debug file
- do not touch the original Asteroids game/debug files beyond the listed source copy
- do not change gameplay logic
- do not widen into entities, systems, levels, or assets in this PR

## Validation Steps
- confirm only the exact target files changed
- confirm the copied debug file is syntax-valid
- confirm the parallel flow/index files resolve imports
- confirm original Asteroids files were not modified

## Acceptance Criteria
- `games/asteroids_new/debug/asteroidsShowcaseDebug.js` exists
- flow/index files in `asteroids_new` resolve against the copied parallel lane files
- original Asteroids debug file remains untouched
