# Codex Command — PR 11.93

Model: GPT-5.4
Reasoning: high

```text
Apply PR 11.93. Inspect games/Asteroids/game.manifest.json and align the asset-browser manifest shape with the expected flat asset map. Move every entry currently under tools.asset-browser.assets.media into tools.asset-browser.assets keyed directly by asset id, then remove the media wrapper. Preserve all audio entries, ensure image.asteroids.bezel uses /games/Asteroids/assets/images/bezel.png with stretchOverride.uniformEdgeStretchPx = 10, ensure image.asteroids.background uses /games/Asteroids/assets/images/deluxe.png, and add font.asteroids.vector-battle using /games/Asteroids/assets/fonts/vector_battle.ttf if missing. Do not create asset-browser.assets.bezel, do not use bezel1.png, and do not add fallback asset-loading paths. Run targeted manifest validation and write findings to docs/dev/reports/PR_11_93_validation.md.
```
