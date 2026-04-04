Toolbox Aid
David Quesenberry
04/03/2026
BUILD_PR_PROJECT_ASSET_REGISTRY.md

# BUILD_PR_PROJECT_ASSET_REGISTRY

## Goal
Implement project-level asset registry support for Sprite Editor, Tile Map Editor, and Parallax Editor using additive, non-destructive behavior while preserving legacy standalone file compatibility and avoiding engine core API changes.

## Implemented scope
- Added shared tool utility: `tools/shared/projectAssetRegistry.js`
  - registry sanitize + merge helpers
  - project-relative path normalization
  - section upsert with duplicate reduction (`id` and normalized `path`)
  - unknown field/top-level preservation where practical
- Integrated Sprite Editor registry workflow:
  - load/save `project.assets.json`
  - additive palette/sprite registry updates on save
  - persisted `assetRefs.paletteId` and `assetRefs.spriteId`
  - registry-aware palette restore fallback on project load
- Integrated Tile Map Editor registry workflow:
  - load/save `project.assets.json`
  - additive `tilesets`, `images`, `parallaxSources` upserts
  - persisted `assetRefs.tilesetId` + `assetRefs.parallaxSourceIds`
  - registry reference resolution fallback on load/sample load
- Integrated Parallax Editor registry workflow:
  - load/save `project.assets.json`
  - additive `images` + `parallaxSources` upserts
  - layer-level `parallaxSourceId` and document `assetRefs.parallaxSourceIds`
  - registry reference resolution fallback on load/sample load
- Added sample project data with shared references:
  - `tools/shared/samples/project-asset-registry-demo/project.assets.json`
  - `tools/shared/samples/project-asset-registry-demo/hero-idle.sprite.json`
  - `tools/shared/samples/project-asset-registry-demo/overworld-main.tilemap.json`
  - `tools/shared/samples/project-asset-registry-demo/overworld-main.parallax.json`

## Compatibility contract
- Legacy standalone tool files continue to load when no registry file exists.
- Registry load is optional and non-blocking.
- Existing save/load workflows remain intact.
- Engine/runtime APIs are unchanged.

## Validation summary
- Syntax checks passed:
  - `node --check tools/shared/projectAssetRegistry.js`
  - `node --check tools/Sprite Editor V3/modules/projectModel.js`
  - `node --check tools/Sprite Editor V3/modules/spriteEditorApp.js`
  - `node --check tools/Sprite Editor V3/main.js`
  - `node --check tools/Tilemap Studio/main.js`
  - `node --check tools/Parallax Scene Studio/main.js`
- Manual contract checklist updated and marked pass in `docs/dev/reports/validation_checklist.txt`.

## Packaging
- Delta ZIP: `tmp/BUILD_PR_PROJECT_ASSET_REGISTRY_delta.zip`
- ZIP contains only files relevant to this PR.
