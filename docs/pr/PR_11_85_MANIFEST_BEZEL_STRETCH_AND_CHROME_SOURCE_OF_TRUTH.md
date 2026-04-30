# PR 11.85 — Manifest Bezel Stretch + Chrome Asset Source of Truth

## Purpose
Add `stretchOverride.uniformEdgeStretchPx = 10` to every `image.*.bezel` manifest entry and enforce `game.manifest.json` as the only source for bezel/background image loading.

## Scope
- Update manifest asset entries named like `image.*.bezel`.
- Add:
  ```json
  "stretchOverride": {
    "uniformEdgeStretchPx": 10
  }
  ```
- Ensure Asteroids keeps:
  - `/games/Asteroids/assets/images/bezel1.png`
  - `/games/Asteroids/assets/images/deluxe.png`
- Remove/deprecate any code path that guesses or hardcodes bezel/background paths such as:
  - `/games/<Game>/assets/images/bezel.png`
  - `/games/<Game>/assets/images/background.png`
- Game chrome must load bezel/background only when declared in `game.manifest.json`.
- Missing optional bezel/background assets must render safe empty state, not request guessed files.

## Non-goals
- Do not add fallback images.
- Do not create aliases or shim loaders.
- Do not rewrite unrelated game manifests.
- Do not modify launch-smoke-owned cleanup artifacts except those explicitly owned by launch smoke.

## Acceptance
- All `image.*.bezel` manifest entries include `stretchOverride.uniformEdgeStretchPx = 10`.
- No code constructs guessed bezel/background URLs.
- SolarSystem no longer requests missing `bezel.png` or `background.png` unless declared in manifest.
- Asteroids bezel/background load from manifest-declared files only.
- Targeted validation documents skipped full sample suite.
