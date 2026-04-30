# PR 11.95 — Flatten Manifest Assets and Fix Loaders

## Purpose
Correct the manifest asset contract so `asset-browser.assets` is the single flat source of truth for all game assets, including images, fonts, audio, SVG, and any future asset kinds.

This PR must fix the code that still expects nested `media` sections instead of restoring or preserving `media` as a special case.

## Scope
- Update game manifests to use a flat `asset-browser.assets` map.
- Remove nested `asset-browser.assets.media` usage.
- Update runtime loaders to read assets directly from `asset-browser.assets`.
- Update Workspace Manager / Asset Browser / SVG Asset Studio consumers to read the same flat map.
- Preserve existing asset IDs such as:
  - `image.asteroids.bezel`
  - `image.asteroids.background`
  - `font.asteroids.vector-battle`
  - `audio.*`
  - `svg.*`
- Keep `kind` as the asset type discriminator.
- Keep bezel stretch data on `image.*.bezel` entries only.

## Required Manifest Shape

```json
{
  "asset-browser": {
    "assets": {
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
        "path": "/games/Asteroids/assets/fonts/vector_battle.ttf",
        "kind": "font",
        "source": "workspace-manager"
      },
      "audio.asteroids.fire": {
        "path": "/games/Asteroids/assets/audio/fire.mp3",
        "kind": "audio",
        "source": "workspace-manager"
      }
    }
  }
}
```

## Explicitly Forbidden
- Do not restore `asset-browser.assets.media`.
- Do not create separate contracts for audio vs image/font/svg.
- Do not hardcode fallback asset paths.
- Do not guess `bezel.png`, `background.png`, `deluxe.png`, or any audio file path outside the manifest.
- Do not add alias/pass-through loaders that simply remap `media` to `assets`.
- Do not place bezel stretch under `asset-browser.assets.bezel`.

## Loader Fix Requirements
Search for and update all code paths that read any of these old shapes:

```text
assetBrowser.assets.media
asset-browser.assets.media
assets.media
manifest.media
media.audio
media.image
media.font
media.svg
```

Replace with flat iteration/filtering over:

```text
manifest["asset-browser"].assets
```

Asset consumers must filter by `kind`:

```js
const assets = manifest?.["asset-browser"]?.assets ?? {};
const imageAssets = Object.entries(assets).filter(([, asset]) => asset.kind === "image");
const audioAssets = Object.entries(assets).filter(([, asset]) => asset.kind === "audio");
const fontAssets = Object.entries(assets).filter(([, asset]) => asset.kind === "font");
```

## Asteroids Requirements
- `image.asteroids.bezel.path` must be `/games/Asteroids/assets/images/bezel.png`.
- Do not use `bezel1.png`.
- `image.asteroids.background.path` must be `/games/Asteroids/assets/images/deluxe.png`.
- `font.asteroids.vector-battle` must exist and point to `/games/Asteroids/assets/fonts/vector_battle.ttf`.
- Existing Asteroids audio files must be listed as flat `audio.asteroids.*` entries if they are currently nested under media.

## Tool Requirements
- SVG Asset Studio must list visible assets from the flat map.
- Asset Browser must list visible assets from the flat map.
- Workspace Manager tile counts must count flat assets by kind/id pattern.
- Runtime game loading must load image/font/audio assets from the flat map.

## Validation
Run targeted checks only.

Required checks:

```powershell
Select-String -Path .\* -Recurse -Pattern "assets\.media"
Select-String -Path .\* -Recurse -Pattern "asset-browser.*media"
Select-String -Path .\* -Recurse -Pattern "bezel1.png"
Select-String -Path .\* -Recurse -Pattern "image\.asteroids\.bezel"
Select-String -Path .\* -Recurse -Pattern "font\.asteroids\.vector-battle"
```

Expected:
- No remaining runtime/tool dependency on nested `media`.
- No `bezel1.png` references.
- Asteroids launches with no 404s for bezel/background/font/audio assets declared in manifest.
- SVG Asset Studio shows manifest assets instead of only saying assets exist.
- Background and bezel still load only from manifest.

## Full Samples Test
Do not run the full samples suite by default. This PR modifies manifest loading code and selected game/tool consumers; use targeted checks for Asteroids, Workspace Manager, Asset Browser, and SVG Asset Studio.

Run full samples only if Codex modifies shared sample loader/framework code broadly enough that targeted validation cannot establish correctness.

## Acceptance
- One flat `asset-browser.assets` contract exists for all asset kinds.
- Runtime loads audio/images/fonts from the flat contract.
- Tools display/list assets from the flat contract.
- `media` is removed as a manifest asset grouping contract.
- Asteroids assets load correctly.
- No hidden fallback or guessed paths remain.
