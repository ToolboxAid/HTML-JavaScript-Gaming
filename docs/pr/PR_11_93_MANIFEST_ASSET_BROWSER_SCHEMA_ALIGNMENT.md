# PR 11.93 — Manifest Asset Browser Schema Alignment

## Purpose
Fix Asteroids manifest asset visibility in SVG Asset Studio / Asset Browser by aligning `game.manifest.json` with the expected asset-browser schema.

## Problem
The uploaded Asteroids manifest currently nests assets under:

```json
"asset-browser": {
  "assets": {
    "media": {
      "image.asteroids.bezel": {}
    }
  }
}
```

But earlier PR contracts and tool lookup expectations use flat asset IDs directly under `asset-browser.assets`, such as:

```json
"asset-browser": {
  "assets": {
    "image.asteroids.bezel": {}
  }
}
```

This mismatch can cause a tool to detect that assets exist while failing to render a normal asset list.

## Required Change
Update `games/Asteroids/game.manifest.json` so `tools.asset-browser.assets` is a flat map keyed by asset id.

Move all entries currently under:

```text
tools.asset-browser.assets.media.*
```

to:

```text
tools.asset-browser.assets.*
```

Then remove the empty `media` wrapper.

## Required Asset Entries
Ensure the flat asset map includes:

```json
"image.asteroids.bezel": {
  "path": "/games/Asteroids/assets/images/bezel.png",
  "kind": "image",
  "source": "workspace-manager",
  "stretchOverride": {
    "uniformEdgeStretchPx": 10
  }
},
"image.asteroids.background": {
  "path": "/games/Asteroids/assets/images/deluxe.png",
  "kind": "image",
  "source": "workspace-manager"
},
"font.asteroids.vector-battle": {
  "path": "/src/assets/fonts/vector_battle/vector_battle.ttf",
  "kind": "font",
  "source": "workspace-manager"
}
```

Also keep all existing audio entries as flat `audio.asteroids.*` entries under the same `assets` map.

## SSoT Rules
- Do not create `asset-browser.assets.bezel`.
- Do not place `stretchOverride` outside `image.*.bezel`.
- Do not rename `bezel.png`.
- Do not use `bezel1.png`.
- Do not reintroduce guessed or fallback chrome asset paths.
- `game.manifest.json` remains the only source for bezel/background/font asset loading.

## Validation
Run targeted checks:

```powershell
Select-String -Path .\games\Asteroids\game.manifest.json -Pattern '"media"|bezel1.png|asset-browser.assets.bezel'
Select-String -Path .\games\Asteroids\game.manifest.json -Pattern 'image.asteroids.bezel|image.asteroids.background|font.asteroids.vector-battle'
```

Expected:
- no `"media"` wrapper under `asset-browser.assets`
- no `bezel1.png`
- no `asset-browser.assets.bezel`
- `image.asteroids.bezel` exists with `bezel.png` and `stretchOverride.uniformEdgeStretchPx = 10`
- `image.asteroids.background` exists with `deluxe.png`
- `font.asteroids.vector-battle` exists with `vector_battle.ttf`

Open Workspace Manager / SVG Asset Studio / Asset Browser and confirm:
- assets list is visible
- image assets are visible
- font asset is visible
- no 404s for bezel/background/font
