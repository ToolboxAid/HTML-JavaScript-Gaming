Toolbox Aid
David Quesenberry
04/04/2026
BUILD_PR_PARALLAX_EDITOR_ASSET_REGISTRY_ADOPTION.md

# BUILD_PR_PARALLAX_EDITOR_ASSET_REGISTRY_ADOPTION

## Goal
Integrate Parallax Editor with the shared project asset registry using ID-based references while preserving backward compatibility and avoiding engine core API changes.

## Implemented scope
- Reused shared registry helpers already used by Sprite Editor and Tile Map Editor.
- Kept additive registry integration for Parallax Editor:
  - load/save `project.assets.json`
  - additive `images` and `parallaxSources` upserts
  - persisted layer-level `parallaxSourceId`
  - persisted document-level `assetRefs.parallaxSourceIds`
- Switched registry-managed parallax saves to prefer ID-based references:
  - saved parallax JSON omits direct `imageSource` paths for registry-managed layers
  - tilemap parallax patch export uses the same ID-first shape
- Preserved backward compatibility:
  - legacy parallax and tilemap documents with direct paths still load
  - registry resolution restores missing paths lazily when ids are available
  - unresolved refs degrade with status messaging instead of hard failure

## Scope boundaries honored
- No engine core API changes
- No Sprite Editor or Tile Map Editor rework
- No destructive registry replacement behavior

## Validation summary
- Syntax checks passed:
  - `node --check tools/shared/projectAssetRegistry.js`
  - `node --check tools/Parallax Editor/main.js`
- Validation checklist updated and all items marked pass in `docs/dev/reports/validation_checklist.txt`.

## Packaging
- Delta ZIP: `tmp/BUILD_PR_PARALLAX_EDITOR_ASSET_REGISTRY_ADOPTION_delta.zip`
- ZIP contains only files relevant to this PR.
