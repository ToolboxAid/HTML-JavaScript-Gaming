# PR 11.86 — Manifest Bezel Stretch SSoT

## Purpose
Keep bezel stretch configuration in exactly one place: the `image.*.bezel` asset entry inside each `game.manifest.json`.

## Required change
- Add or keep:
  ```json
  "stretchOverride": {
    "uniformEdgeStretchPx": 10
  }
  ```
  only on manifest entries whose key matches `image.*.bezel`.
- Remove any duplicate bezel stretch configuration from `asset-browser.assets.bezel` or equivalent asset-browser/chrome-helper locations.
- Preserve `image.*.background` entries without bezel stretch metadata unless explicitly required by a future PR.

## Source of truth rule
`game.manifest.json` image entries are the only source of truth for bezel/background asset loading and bezel stretch metadata.

## Acceptance
- `image.asteroids.bezel` contains `stretchOverride.uniformEdgeStretchPx = 10`.
- No `asset-browser.assets.bezel.stretchOverride` remains.
- No hardcoded or fallback bezel/background paths are introduced.
- Runtime still loads Asteroids bezel/background from `game.manifest.json` only.
