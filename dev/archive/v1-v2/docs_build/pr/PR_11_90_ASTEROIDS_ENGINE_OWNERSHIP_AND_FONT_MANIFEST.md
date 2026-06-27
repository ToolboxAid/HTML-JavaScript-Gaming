# PR 11.90 — Asteroids Engine Ownership and Font Manifest Repair

## Purpose
Finish Asteroids alignment with the engine-owned render/chrome contract and add the Asteroids font to the asset-browser manifest assets.

## Findings from uploaded Asteroids.zip

The uploaded Asteroids game still contains game-level render/chrome overrides:

1. `games/Asteroids/game/AsteroidsGameScene.js` still draws a full-screen rect at the start of `render()`.
   - This means Asteroids still controls the frame background/clear layer.
   - When a manifest background exists, the fill is translucent, but the game is still overriding engine-owned background layering.

2. `games/Asteroids/game/AsteroidsAttractAdapter.js` still draws a full-screen attract overlay.
   - It is translucent when a manifest background exists, but it is still a full-frame game overlay that can visually suppress the engine background.
   - Keep only intentional text/sprite/menu visuals; do not use an opaque/near-opaque frame fill as a background substitute.

3. `games/Asteroids/game/FullscreenBezelOverlay.js` still contains Asteroids-specific bezel resolution.
   - Bezel/background should be engine-owned and manifest-driven.
   - Remove/deprecate game-local fullscreen bezel loading/rendering when the engine chrome layer provides this behavior.

4. `games/Asteroids/game.manifest.json` has the bezel path set to `/games/Asteroids/assets/images/bezel.png`.
   - The desired Asteroids bezel is `/games/Asteroids/assets/images/bezel1.png`.
   - Keep `stretchOverride.uniformEdgeStretchPx = 10` only on `image.asteroids.bezel`.

5. `src/assets/fonts/vector_battle/vector_battle.ttf` exists, but no font asset entry is present in `asset-browser.assets`.

## Required changes

### Manifest assets
Update `games/Asteroids/game.manifest.json`:

- Ensure `asset-browser.assets.image.asteroids.bezel.path` is `/games/Asteroids/assets/images/bezel1.png`.
- Ensure `asset-browser.assets.image.asteroids.background.path` is `/games/Asteroids/assets/images/deluxe.png`.
- Ensure `asset-browser.assets.image.asteroids.bezel.stretchOverride.uniformEdgeStretchPx` is `10`.
- Add a font asset entry:

```json
"font.asteroids.vector-battle": {
  "path": "/src/assets/fonts/vector_battle/vector_battle.ttf",
  "kind": "font",
  "source": "workspace-manager"
}
```

Do not place font data outside `asset-browser.assets`.

### Engine ownership
Asteroids must not own engine chrome/background/clear responsibilities.

Codex must remove or neutralize these remaining overrides:

- `AsteroidsGameScene.render()` full-screen background/clear fill.
- `AsteroidsAttractAdapter.render()` full-screen dark frame fill when a manifest background exists.
- Any Asteroids-local bezel/background loader/renderer that duplicates engine chrome responsibilities, especially `FullscreenBezelOverlay.js`, unless it is still directly required and only delegates to the engine manifest chrome layer.

Gameplay rendering remains in Asteroids:

- ships
- asteroids
- bullets
- saucers
- score/lives/menu/high-score text
- intentional game-specific vector visuals

### No fallback asset guessing
Do not introduce fallback paths such as:

- `/games/Asteroids/assets/images/bezel.png`
- `/games/Asteroids/assets/images/background.png`
- `/games/SolarSystem/assets/images/bezel.png`
- `/games/SolarSystem/assets/images/background.png`

Game chrome assets must resolve only through manifest asset ids.

## Acceptance

- `game.manifest.json` includes font, bezel, and background assets under `asset-browser.assets`.
- `image.asteroids.bezel` uses `bezel1.png`.
- `image.asteroids.background` uses `deluxe.png`.
- `image.asteroids.bezel.stretchOverride.uniformEdgeStretchPx` is `10`.
- There is no `asset-browser.assets.bezel` duplicate contract.
- Asteroids no longer draws an engine-owned background/clear layer.
- Asteroids no longer uses game-local bezel/background loading/rendering that bypasses the engine manifest layer.
- No 404s for bezel/background/font assets.
- Background is visible in menu, attract, pause, and gameplay.
- Bezel is visible and stretched using the manifest SSoT value.

## Testing

Run targeted tests only. Do not run the full samples smoke test.

1. Open `games/Asteroids/index.html`.
2. Confirm menu/attract/gameplay/pause all keep the manifest background visible.
3. Confirm the bezel renders from `image.asteroids.bezel`.
4. Confirm no console 404s for chrome assets or font.
5. Search repo for forbidden paths and stale references.
