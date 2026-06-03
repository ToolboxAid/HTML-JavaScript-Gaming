# PR 11.97 - Fix Asset Browser Schema Properly

## Purpose
Update the Asset Browser schema so it matches the current flat manifest contract:

- `asset-browser.assets` is the single source of truth for all asset kinds.
- No nested `media` contract.
- No generic asset keys like `preview`.
- Asset ids must use a predictable namespaced form such as `image.sample1902.preview`, `image.asteroids.bezel`, `font.asteroids.vector-battle`, or `audio.asteroids.fire`.

## Scope
- Update `toolbox/schemas/tools/asset-browser.schema.json`.
- Add an `assets` property under the asset-browser payload/model where this repo expects Asset Browser payload validation.
- Validate each asset entry requires `path`, `kind`, and `source`.
- Allow optional per-asset fields such as `stretchOverride` for bezel assets.
- Align sample 1902 workspace usage to the flat asset-id model.
- Do not restore `media`.
- Do not move runtime loaders back to nested media.

## Required schema behavior
The schema must accept:

```json
"assets": {
  "image.sample1902.preview": {
    "path": "/samples/phase-19/1902/assets/images/preview.svg",
    "kind": "image",
    "source": "workspace-manager"
  },
  "image.asteroids.bezel": {
    "path": "/games/Asteroids/assets/images/bezel.png",
    "kind": "image",
    "source": "workspace-manager",
    "stretchOverride": {
      "uniformEdgeStretchPx": 10
    }
  }
}
```

The schema must reject or flag generic keys such as:

```json
"assets": {
  "preview": {}
}
```

## Asset id rule
Use this shape:

```text
<kind>.<domain>.<name>
```

Examples:

```text
image.sample1902.preview
image.asteroids.bezel
image.asteroids.background
font.asteroids.vector-battle
audio.asteroids.fire
```

## Implementation notes for Codex
1. Open `toolbox/schemas/tools/asset-browser.schema.json`.
2. Add an `assets` property in the correct schema location used by asset-browser payload validation.
3. Define `$defs.assetMap` and `$defs.assetEntry` rather than leaving `assets` as unconstrained `jsonValue`.
4. Keep compatibility fields currently present unless they are explicitly obsolete.
5. Do not remove `assetCatalog`, `assetBrowserPreset`, `approvedAssets`, or `importHubPreset` unless current code proves they are obsolete.
6. Ensure `additionalProperties: false` does not block the new `assets` property.
7. Update sample 1902 manifest/workspace data so its preview uses `image.sample1902.preview`, not `preview`.
8. Search the repo for `"assets": { "preview"` and generic `"preview"` asset ids and fix them if they are Asset Browser asset entries.

## Validation
Run targeted validation only:

```powershell
# Schema parses
Get-Content .\tools\schemas\tools\asset-browser.schema.json | ConvertFrom-Json | Out-Null

# No nested media contract in asset-browser assets
Select-String -Path .\samples\**\*.json, .\games\**\*.json -Pattern '"media"'

# No generic preview asset id under asset-browser.assets
Select-String -Path .\samples\**\*.json, .\games\**\*.json -Pattern '"preview"\s*:'

# Confirm sample 1902 preview asset id
Select-String -Path .\samples\phase-19\1902\*.json -Pattern 'image.sample1902.preview'
```

Do not run the full sample suite unless a shared loader/framework change requires it.

## Acceptance
- Asset Browser schema defines flat `assets`.
- Asset entries require `path`, `kind`, and `source`.
- Bezel `stretchOverride.uniformEdgeStretchPx` is valid only on asset entries such as `image.*.bezel`.
- Sample 1902 uses `image.sample1902.preview`.
- Runtime/tool loaders remain aligned to flat `asset-browser.assets`.
- No `media` restoration.
