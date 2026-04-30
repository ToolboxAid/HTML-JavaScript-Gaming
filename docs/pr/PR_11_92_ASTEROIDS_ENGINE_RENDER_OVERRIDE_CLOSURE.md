# PR 11.92 — Asteroids Engine Render Override Closure

## Purpose
Finish the Asteroids engine-ownership cleanup correctly.

Asteroids must use the engine for engine-owned concerns and must not override:
- canvas/background clearing
- manifest background drawing
- bezel/chrome drawing
- manifest asset source-of-truth
- font asset registration

The game may still draw gameplay-specific vectors, HUD text, bullets, asteroids, ship, UFO, score, pause labels, and high-score initials UI.

## Evidence from uploaded Asteroids.zip
Remaining issues found in the uploaded Asteroids bundle:

1. `games/Asteroids/game/AsteroidsGameScene.js`
   - `hasManifestBackgroundLayer(engine)` reads engine background state from the game.
   - `render()` draws a full-screen `renderer.drawRect(0, 0, this.world.bounds.width, this.world.bounds.height, ...)` before gameplay.
   - This is still a game-owned background/clear override.

2. `games/Asteroids/game/AsteroidsAttractAdapter.js`
   - `render(renderer, options = {})` accepts `manifestBackgroundPresent`.
   - It draws full-screen `renderer.drawRect(0, 0, 960, 720, ...)`.
   - This is still an attract-mode overlay that can hide/dim the manifest background.

3. `games/Asteroids/game/FullscreenBezelOverlay.js`
   - Asteroids still has local fullscreen bezel overlay code.
   - Bezel/chrome is engine-owned and manifest-driven. This file must not remain wired into Asteroids runtime.

4. `games/Asteroids/game.manifest.json`
   - `image.asteroids.bezel` is correct and must stay `/games/Asteroids/assets/images/bezel.png`.
   - `image.asteroids.background` is correct and must stay `/games/Asteroids/assets/images/deluxe.png`.
   - `font.asteroids.vector-battle` is missing from `asset-browser.assets` even though `assets/fonts/vector_battle.ttf` exists and the game uses `Vector Battle`.

## Required changes

### A. Remove Asteroids game-owned background detection
In `games/Asteroids/game/AsteroidsGameScene.js`:
- Remove `hasManifestBackgroundLayer(engine)`.
- Remove `manifestBackgroundPresent` from `render()`.
- Remove the full-screen background `renderer.drawRect(...)` at the start of `render()`.
- Do not replace it with another full-screen clear/fill.

Allowed: keep starfield/gameplay vector drawing if it is intentional gameplay rendering.

### B. Remove attract adapter full-screen background override
In `games/Asteroids/game/AsteroidsAttractAdapter.js`:
- Remove `options.manifestBackgroundPresent` logic.
- Remove the full-screen `renderer.drawRect(0, 0, 960, 720, ...)` from `render()`.
- Do not add a replacement full-screen opaque or darkening rect.
- If text contrast is needed later, use small local text panels only, not full-screen fills.

### C. Remove Asteroids-local bezel ownership
Search Asteroids for `FullscreenBezelOverlay`.
- Remove imports/usages from Asteroids runtime.
- Delete `games/Asteroids/game/FullscreenBezelOverlay.js` only if no imports remain.
- Do not add a shim or alias.
- Do not move bezel ownership into another Asteroids-local file.

### D. Keep canonical bezel filename
Do not change the bezel filename.

Required manifest entry:

```json
"image.asteroids.bezel": {
  "path": "/games/Asteroids/assets/images/bezel.png",
  "kind": "image",
  "source": "workspace-manager",
  "stretchOverride": {
    "uniformEdgeStretchPx": 10
  }
}
```

Forbidden:
- `bezel1.png`
- alternate bezel filenames
- `asset-browser.assets.bezel.stretchOverride`

### E. Add font asset to manifest asset-browser assets
In `games/Asteroids/game.manifest.json`, under `tools.asset-browser.assets`, add:

```json
"font.asteroids.vector-battle": {
  "path": "/games/Asteroids/assets/fonts/vector_battle.ttf",
  "kind": "font",
  "source": "workspace-manager"
}
```

Do not rename the font file.

### F. Validation searches
After edits, these must pass:

```powershell
Select-String -Path .\games\Asteroids\**\*.js -Pattern "hasManifestBackgroundLayer"
Select-String -Path .\games\Asteroids\**\*.js -Pattern "manifestBackgroundPresent"
Select-String -Path .\games\Asteroids\**\*.js -Pattern "FullscreenBezelOverlay"
Select-String -Path .\games\Asteroids\**\*.js -Pattern "bezel1.png"
```

Expected: no results.

Also inspect remaining full-screen `drawRect` calls:

```powershell
Select-String -Path .\games\Asteroids\**\*.js -Pattern "drawRect\(0, 0"
```

Allowed only for clearly modal/local overlays that are not background/chrome ownership. Pause and initials overlays may remain if they are gameplay UI states and intentionally translucent. They must not be used as background rendering.

### G. Browser validation
Open Asteroids and verify:
- no 404s for `bezel.png`, `deluxe.png`, or `vector_battle.ttf`
- background visible in menu
- background visible in attract
- background visible in gameplay
- bezel visible in fullscreen/chrome layer
- no `bezel1.png` request
- no game-local bezel overlay behavior

## Out of scope
- Do not refactor gameplay systems.
- Do not move audio to engine audio in this PR.
- Do not change scoring, ship, asteroids, UFO, bullets, particles, or high-score behavior.
- Do not rename assets.
