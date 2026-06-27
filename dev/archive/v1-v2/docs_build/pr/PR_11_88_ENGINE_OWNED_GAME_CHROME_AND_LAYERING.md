# PR 11.88 — Engine-Owned Game Chrome and Layering Fix

## Purpose
Fix the Asteroids/engine boundary so engine-provided systems are not bypassed by game-specific rendering.

## Scope
This PR fixes all currently identified issues in one targeted pass:

1. `game.manifest.json` is the only source of truth for bezel/background chrome assets.
2. `image.*.bezel` entries own bezel-specific `stretchOverride.uniformEdgeStretchPx`.
3. `asset-browser.assets.bezel` must not contain bezel stretch metadata.
4. Manifest-declared background images draw in every game state, including menu, attract, title, pause, and gameplay.
5. If a manifest background exists, game/scene code must not perform an opaque clear/fill that hides it.
6. Asteroids must stop suppressing or visually covering engine-managed background/chrome layers.
7. Any remaining hardcoded `/assets/images/bezel.png`, `/assets/images/background.png`, `bezel1.png`, or `deluxe.png` loading outside the manifest path must be removed or routed through manifest lookup.

## Architecture Rule
Engine owns environment/chrome:

- render loop
- scene lifecycle
- manifest asset loading
- background layer
- bezel/chrome layer
- canvas clear policy for manifest backgrounds

Game owns gameplay:

- player objects
- enemies/asteroids
- bullets/projectiles
- scoring/HUD text
- gameplay-specific overlays that do not hide engine background

## Required Changes

### 1. Asteroids manifest
Update `games/Asteroids/game.manifest.json` so Asteroids declares:

```json
"image.asteroids.bezel": {
  "path": "/games/Asteroids/assets/images/bezel1.png",
  "kind": "image",
  "source": "workspace-manager",
  "stretchOverride": {
    "uniformEdgeStretchPx": 10
  }
}
```

Also ensure Asteroids background is declared as:

```json
"image.asteroids.background": {
  "path": "/games/Asteroids/assets/images/deluxe.png",
  "kind": "image",
  "source": "workspace-manager"
}
```

Do not add this stretch override under `asset-browser.assets.bezel`.

### 2. Manifest-only chrome loading
Find and remove/deprecate any code that guesses these paths:

- `/games/<Game>/assets/images/bezel.png`
- `/games/<Game>/assets/images/background.png`
- `/assets/images/bezel.png`
- `/assets/images/background.png`

The loader may only request background or bezel images if a matching manifest image asset exists.

### 3. Background rendering
Update the background layer so a manifest-declared background is drawn regardless of game/session mode.

Do not gate background drawing to gameplay-only states.

The background layer should safely no-op only when no manifest background asset exists.

### 4. Clear/fill policy
When a manifest background exists and is loaded:

- do not clear with an opaque color that hides the background
- do not draw an opaque full-screen game fill before the background is visible
- if a game wants mood/dimming, use transparent or semi-transparent overlays only after the engine background draw

### 5. Asteroids attract/menu overlay
Review `games/Asteroids` rendering paths, especially:

- `AsteroidsGameScene.js`
- `AsteroidsAttractAdapter.js`
- any background image helper/layer such as `backgroundImage.js`

Remove full-screen opaque fills that hide manifest background in menu/attract/pause/title states.
Replace them with transparent or semi-transparent overlays only where visually required.

### 6. Regression scan
After changes, run a literal search for guessed chrome paths and stale engine-utils references:

- `assets/images/bezel.png`
- `assets/images/background.png`
- `/src/engine/utils/`
- `src/engine/utils/`

Fix any active source references found. Do not modify reports or generated output unless the PR regenerates them intentionally.

## Acceptance Criteria

- Asteroids loads bezel from `bezel1.png` via `game.manifest.json` only.
- Asteroids loads background from `deluxe.png` via `game.manifest.json` only.
- `image.asteroids.bezel` contains `stretchOverride.uniformEdgeStretchPx = 10`.
- No `asset-browser.assets.bezel.stretchOverride` remains.
- SolarSystem and other games with no declared background/bezel do not 404 guessed chrome paths.
- Manifest-declared background is visible in menu, attract, pause, title, and gameplay states.
- Asteroids does not opaque-fill over the engine background.
- No active source reference remains to `src/engine/utils/`.

## Testing
Targeted only. Do not run the full sample suite.

Run:

1. Open Workspace Manager.
2. Launch Asteroids.
3. Verify background visible on menu/attract and gameplay.
4. Verify bezel uses `bezel1.png` and edge stretch applies.
5. Launch SolarSystem.
6. Verify no 404 for `bezel.png` or `background.png`.
7. Check browser console for missing module/asset errors.
8. Run literal source searches listed above.

## Full sample suite
Skipped. This PR touches game chrome/render layering and manifest loading only. Targeted game launch validation is sufficient.
