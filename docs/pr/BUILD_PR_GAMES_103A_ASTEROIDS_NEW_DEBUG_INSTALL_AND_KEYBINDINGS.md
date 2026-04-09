# BUILD PR — Asteroids New Debug Install + Keybindings

## Purpose
Ensure debug system is actually installed and keybindings work:

- Ctrl+Shift+`
- Shift+`

Currently debug is not active even though game runs.

## Exact Target Files
- `games/asteroids_new/index.html`
- `games/asteroids_new/index.js`
- `src/engine/debug/**` (READ ONLY for reference, do not modify)
- `games/asteroids_new/debug/**` (only if wiring exists)

## Required Code Changes

1. Ensure debug system is initialized
   - locate how other working samples enable debug
   - replicate the same initialization pattern in asteroids_new

2. Ensure debug host is attached to DOM
   - debug UI/container must be created and appended
   - must run after DOM is ready

3. Ensure keybindings are registered
   - Ctrl+Shift+` → toggle debug
   - Shift+` → alternate debug view
   - verify event listeners are attached

4. Verify correct import paths
   - debug modules must import from:
     `/src/engine/debug/...`
   - no relative path drift

5. Do NOT modify debug engine implementation
   - only fix wiring/installation

## Hard Constraints
- no engine changes
- no new debug system
- no widening beyond asteroids_new wiring
- minimal changes only

## Validation Steps
- load: games/asteroids_new/index.html
- press Ctrl+Shift+`
- press Shift+`
- confirm debug UI appears
- confirm no console errors
- confirm gameplay unaffected

## Acceptance Criteria
- debug system is visible and toggleable
- keybindings work
- no engine modifications
