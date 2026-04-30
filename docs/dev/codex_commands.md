# Codex Commands — PR 11.91

Model: GPT-5.4
Reasoning: high

```text
Apply PR 11.91. Standardize Asteroids bezel asset naming so bezel.png is the only valid bezel file. Update games/Asteroids/game.manifest.json image.asteroids.bezel.path to /games/Asteroids/assets/images/bezel.png, preserve stretchOverride.uniformEdgeStretchPx = 10 on image.asteroids.bezel only, remove any bezel1.png references, do not add fallback guessed paths, and do not place bezel stretch configuration under asset-browser.assets.bezel. Run targeted validation and write findings to docs/dev/reports/PR_11_91_validation.md.
```
