Toolbox Aid
David Quesenberry
04/04/2026
BUILD_PR_TILEMAP_EDITOR_ASSET_REGISTRY_ADOPTION.md

# BUILD_PR_TILEMAP_EDITOR_ASSET_REGISTRY_ADOPTION

## Goal
Implement the approved Tile Map Editor asset registry adoption slice from `PLAN_PR_TILEMAP_EDITOR_ASSET_REGISTRY_ADOPTION` using the shared registry helpers already established by Sprite Editor.

## Implemented scope
- Extended `tools/shared/projectAssetRegistry.js` so `tilemaps` is a first-class additive registry section.
- Kept shared registry behavior non-destructive:
  - preserves existing known groups
  - preserves unknown top-level safe fields
  - preserves unknown safe fields on known entries where practical
- Updated Tile Map Editor registry integration:
  - loads and saves `project.assets.json`
  - persists optional `assetRefs.tilemapId` and `assetRefs.tilesetId`
  - additively upserts `tilemaps` and relevant `tilesets`
  - resolves `tilesetId` from the shared registry when local path data is absent
  - surfaces soft status messages when registry references are unresolved
- Preserved backward compatibility for legacy tile map JSON files with no `assetRefs`.

## Scope boundaries honored
- No engine core API changes
- No Sprite Editor rework
- No Parallax Editor implementation work in this PR
- No destructive registry replacement behavior

## Validation summary
- Syntax checks passed:
  - `node --check tools/shared/projectAssetRegistry.js`
  - `node --check tools/Tile Map Editor/main.js`
- Validation checklist updated and all items marked pass in `docs/dev/reports/validation_checklist.txt`.

## Packaging
- Delta ZIP: `tmp/BUILD_PR_TILEMAP_EDITOR_ASSET_REGISTRY_ADOPTION_delta.zip`
- ZIP contains only files relevant to this PR.
