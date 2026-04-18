# PLAN_PR_TILEMAP_EDITOR_ASSET_REGISTRY_ADOPTION

## Purpose
Adopt the shared project asset registry in Tile Map Editor using the Sprite Editor registry contracts already present in the latest uploaded Sprite Editor code. This PR is docs-only and defines the next small, surgical implementation step for Codex. No implementation code is included in this bundle.

## Why this PR now
The uploaded Sprite Editor already shows additive project asset registry behavior:
- registry load/save in Project I/O
- sprite asset registration
- palette asset registration
- `assetRefs` persisted in sprite JSON
- compatibility with engine-owned palette authority

That means the next safest repo step is not more Sprite Editor coding. The next step is to let Tile Map Editor consume and publish the same registry contracts so sprite, palette, and tileset assets can be resolved through one project-owned asset graph.

## Goals
1. Make Tile Map Editor able to load and save `project.assets.json`.
2. Register tilemap-owned assets additively without overwriting Sprite Editor entries.
3. Resolve sprite and palette references from the shared registry by id, not by hard-coded editor-local paths.
4. Preserve backward compatibility for older tilemap files that have no registry or `assetRefs`.
5. Keep engine APIs unchanged and avoid runtime-breaking coupling.

## Non-Goals
- No engine core API changes.
- No Sprite Editor rework in this PR.
- No Parallax Editor adoption in this PR.
- No forced migration of legacy tilemap JSON files.
- No full-project asset browser UI in this PR.

## Proposed Scope
### In scope
- Tile Map Editor project I/O integration for `project.assets.json`
- Additive registry merge/update behavior
- `assetRefs` support on tilemap project documents
- Registry-based resolution for palette/tileset/sprite references where Tile Map Editor already has compatible hooks
- Graceful fallback when registry entries are missing or stale
- Minimal status messaging showing whether registry resolution succeeded or fell back

### Out of scope
- Registry garbage collection
- Cross-tool rename propagation
- Asset preview galleries
- Registry schema expansion beyond what Tile Map Editor needs for adoption

## Current reference state from uploaded Sprite Editor
The uploaded Sprite Editor code indicates the following contracts are already live and should be treated as source constraints for this PR:
- imports shared registry helpers from `../../shared/projectAssetRegistry.js`
- uses additive upsert/merge flows instead of replacing the registry wholesale
- persists `assetRefs.paletteId` and `assetRefs.spriteId`
- keeps palette selection engine-owned and locked after selection
- supports legacy JSON when registry refs are absent

Tile Map Editor adoption must match these behaviors rather than inventing a parallel contract.

## Target Contracts
### 1. Shared registry ownership
- Project registry remains project-owned, not editor-owned.
- Tile Map Editor reads and writes the same `project.assets.json` used by Sprite Editor.
- Tile Map Editor must preserve foreign asset groups and unknown fields when safely possible.

### 2. Additive write contract
- Saving from Tile Map Editor updates only relevant tilemap/tile-related entries.
- Existing `sprites`, `palettes`, and future groups are preserved.
- Registry writes must be deterministic and id-stable.

### 3. Asset identity contract
Use ids, not direct editor-local paths, for logical references:
- `paletteId`
- `spriteId` when tile placements or entity markers reference sprite assets
- `tilesetId`
- `tilemapId`

Paths may still exist as metadata, but runtime/editor linkage should prefer ids.

### 4. Legacy compatibility contract
- Old tilemap files without `assetRefs` remain loadable.
- Old tilemap files without registry access remain editable.
- Missing registry entries produce soft warnings, not hard failure.
- Editor may fall back to local embedded config/path behavior when registry lookup fails.

### 5. Small-slice adoption contract
- Only adopt the minimum registry surface Tile Map Editor needs.
- Do not redesign Tile Map Editor data model beyond the registry seam.
- Avoid coupling Tile Map Editor to Sprite Editor implementation details.

## Expected data additions
### Tile Map project document
Add optional `assetRefs` block:
```json
{
  "assetRefs": {
    "paletteId": "palette:arcade-classic",
    "tilesetId": "tileset:forest-pack",
    "spriteIds": ["sprite:hero-idle", "sprite:coin-spin"]
  }
}
```

### Registry groups used by Tile Map Editor
Expected additive groups:
- `palettes`
- `sprites`
- `tilesets`
- `tilemaps`

### Suggested tilemap registry entry
```json
{
  "id": "tilemap:overworld-01",
  "name": "overworld-01",
  "path": "assets/tilemaps/overworld-01.json",
  "tilesetId": "tileset:forest-pack",
  "paletteId": "palette:arcade-classic",
  "sourceTool": "tile-map-editor"
}
```

## Likely files for Codex to inspect
- `tools/Tilemap Studio/index.html`
- `tools/Tilemap Studio/main.js`
- `tools/Tilemap Studio/modules/*`
- `shared/projectAssetRegistry.js`
- any repo docs already describing project JSON or asset packaging

## Implementation guidance for Codex
### Do
- Reuse shared registry helpers that Sprite Editor already uses.
- Mirror Sprite Editor additive merge/upsert patterns where appropriate.
- Keep UI additions minimal and status-oriented.
- Preserve current Tile Map Editor flows first; add registry as an additive layer.

### Do not
- Do not rewrite Tile Map Editor architecture.
- Do not break editor startup when registry file is absent.
- Do not introduce engine dependency changes.
- Do not silently discard foreign registry groups.

## Manual validation checklist
1. Load Tile Map Editor without a registry file; normal legacy editing still works.
2. Load `project.assets.json`; existing sprite and palette entries remain visible/preserved after save.
3. Save a tilemap; registry receives stable `tilemaps` entry and any needed `tilesets` linkage.
4. Reload saved registry and tilemap; ids resolve correctly.
5. Missing `tilesetId` or `paletteId` triggers soft warning only.
6. Legacy tilemap JSON with no `assetRefs` loads and can be re-saved.
7. Saving from Tile Map Editor does not delete Sprite Editor `sprites` or `palettes` entries.
8. No engine core APIs are changed.
9. Repo remains limited to this PR scope.

## Risk notes
- Highest risk is destructive registry overwrite.
- Second highest risk is accidental path-based coupling that bypasses ids.
- Third risk is mixed legacy/registry save behavior producing unstable ids.

## BUILD command
MODEL: GPT-5.4
REASONING: high
COMMAND:
Create BUILD_PR_TILEMAP_EDITOR_ASSET_REGISTRY_ADOPTION.

Requirements:
- Docs-first implementation of Tile Map Editor registry adoption only
- Reuse shared registry helpers already used by Sprite Editor
- Add support for loading/saving `project.assets.json`
- Persist optional `assetRefs` for tilemap documents
- Register/update `tilemaps` and relevant `tilesets` additively
- Preserve existing registry groups and unknown safe fields
- Backward compatibility required for legacy tilemap JSON
- No engine core API changes
- No Parallax Editor work in this PR

Validation:
- All checklist items in `docs/reports/validation_checklist.txt` must pass
- Include syntax validation for changed JS files
- Package delta zip only

Package:
- Output zip to `HTML-JavaScript-Gaming/tmp/BUILD_PR_TILEMAP_EDITOR_ASSET_REGISTRY_ADOPTION_delta.zip`

## Commit comment
`plan(tilemap-editor): adopt shared project asset registry contracts`

## Next command after BUILD
`APPLY_PR_TILEMAP_EDITOR_ASSET_REGISTRY_ADOPTION`
