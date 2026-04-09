# BUILD PR — Asteroids New HTML Entrypoint

## Purpose
Make `games/asteroids_new` actually launchable by adding the missing HTML entrypoint that matches the original Asteroids launch pattern.

## Why This PR Exists
Current evidence shows the repo launches Asteroids through HTML pages such as:
- `games/Asteroids/index.html`
- `games/Asteroids/capture-preview.html`

The parallel `games/asteroids_new` lane has JS files, but no confirmed HTML entrypoint wired into that launch pattern. Without an HTML entry, the game code will not execute from the normal host flow.

## Exact Target Files
- `games/asteroids_new/index.html`
- `games/asteroids_new/index.js`

## Required Code Changes
1. Create `games/asteroids_new/index.html` using the original Asteroids HTML launch pattern as the model.
2. Wire the new HTML entrypoint to the existing `games/asteroids_new/index.js`.
3. Update `games/asteroids_new/index.js` only as needed so it matches the HTML entry pattern.
4. Keep the result minimal and launch-focused.

## Hard Constraints
- exact files only
- do not modify any original `games/Asteroids/*` files
- do not modify root `index.html`
- do not modify `games/index.html`
- do not widen into gameplay fixes, assets, debug UI redesign, or registry work
- do not refactor unrelated logic
- focus only on making `games/asteroids_new` reachable and executable through its own HTML page

## Validation Steps
- confirm only the exact target files changed
- confirm `games/asteroids_new/index.html` loads `games/asteroids_new/index.js`
- confirm opening `games/asteroids_new/index.html` produces visible execution or real runtime errors instead of silence
- confirm no original `games/Asteroids/*` files changed

## Acceptance Criteria
- `games/asteroids_new/index.html` exists
- it launches the parallel game entry
- `games/asteroids_new` is now reachable through an HTML page
- execution is visible or real runtime failures are exposed
- original Asteroids files remain untouched
