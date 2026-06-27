# PR 11.92 Findings

Uploaded `Asteroids.zip` still contains engine-ownership violations:

- `AsteroidsGameScene.js` has `hasManifestBackgroundLayer(engine)` and draws a full-screen background rectangle in `render()`.
- `AsteroidsAttractAdapter.js` accepts `manifestBackgroundPresent` and draws a full-screen attract rectangle.
- `FullscreenBezelOverlay.js` remains as Asteroids-local bezel handling.
- `game.manifest.json` has correct image entries but is missing `font.asteroids.vector-battle` for `src/assets/fonts/vector_battle/vector_battle.ttf`.

Corrective direction:

- Engine owns background, bezel, chrome layering, and manifest asset loading.
- Asteroids owns gameplay-specific vector rendering only.
- `bezel.png` is canonical. Do not use `bezel1.png`.
