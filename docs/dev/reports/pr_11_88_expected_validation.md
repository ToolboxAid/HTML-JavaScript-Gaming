# PR 11.88 Expected Validation

Codex must replace this with execution-backed validation after applying the PR.

Expected checks:

- Asteroids manifest declares image.asteroids.bezel path /games/Asteroids/assets/images/bezel1.png.
- Asteroids manifest declares image.asteroids.background path /games/Asteroids/assets/images/deluxe.png.
- image.*.bezel entries carry stretchOverride.uniformEdgeStretchPx where required.
- asset-browser.assets.bezel does not carry stretchOverride.
- Manifest background draws in non-gameplay states.
- SolarSystem does not request guessed bezel.png/background.png.
- No active source references remain to src/engine/utils/.
