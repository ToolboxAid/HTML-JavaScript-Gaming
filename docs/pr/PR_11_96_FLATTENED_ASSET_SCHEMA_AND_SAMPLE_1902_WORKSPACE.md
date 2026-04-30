# PR 11.96 — Flattened Asset Schema and Sample 1902 Workspace Alignment

## Purpose
Complete the manifest contract correction started in PR 11.95 by updating the schema and sample 1902 workspace usage to the flattened `asset-browser.assets` model.

## Scope
- Keep `asset-browser.assets` as the single flat asset map for all asset kinds.
- Remove reliance on nested `media` asset buckets in runtime/tool/workspace loading code.
- Update schema definitions/documentation so the flat model is the contract.
- Update sample 1902 workspace data/code that still expects old workspace/media-shaped asset data.
- Preserve existing asset IDs such as `image.*`, `font.*`, `audio.*`, `svg.*`.

## Required Contract
```json
{
  "asset-browser": {
    "assets": {
      "image.asteroids.bezel": {
        "path": "/games/Asteroids/assets/images/bezel.png",
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

## Codex Tasks
1. Search for old nested media contract usage:
   - `asset-browser.assets.media`
   - `.assets.media`
   - `media.audio`
   - `media.images`
   - `media.fonts`
   - `media.svg`
2. Update runtime loaders and tool loaders to read the flat `asset-browser.assets` map.
3. Update sample 1902 workspace JSON/JS so it uses the same flat asset map as games/tools.
4. Update schema files and schema docs that describe asset manifests.
5. Keep `stretchOverride` only on `image.*.bezel` entries, not on grouped/browser placeholder nodes.
6. Do not add compatibility shims, aliases, fallback data, or hidden default assets.
7. Do not restore `media`.

## Acceptance Criteria
- No code path requires `asset-browser.assets.media`.
- Sample 1902 Workspace Manager still loads and lists assets.
- SVG Asset Studio shows assets from the flat map.
- Game runtime loads image, font, audio, and SVG entries from the flat map.
- Asteroids still loads `bezel.png`, `deluxe.png`, and `vector_battle.ttf` from manifest entries.
- No 404s caused by guessed bezel/background/font paths.
- Schema validates flat `asset-browser.assets` entries for all asset kinds.

## Targeted Validation
Run targeted checks only:
- Open sample 1902 Workspace Manager.
- Open SVG Asset Studio from Workspace Manager and confirm assets are listed/visible.
- Open Asteroids and confirm background, bezel, and font load from manifest.
- Search confirms zero old media contract references remain except historical docs/reports.

## Full Suite
Skip full samples suite. Reason: changes are targeted to manifest schema/loader/workspace contract and can be validated with sample 1902 plus Asteroids.
