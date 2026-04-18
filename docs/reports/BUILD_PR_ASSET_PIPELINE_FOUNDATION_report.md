# BUILD_PR_ASSET_PIPELINE_FOUNDATION Report

## Scope Outcome
- Established a minimal shared asset-pipeline foundation with explicit stages:
  - ingest
  - normalize
  - validate
  - register
- Reused existing `tools/shared` asset/project helpers for ID/path normalization and registry upsert.
- Added only minimal adapters in active-tool ingest paths (Tilemap, Parallax, Sprite).
- No UI/theme changes, no editor-state redesign, no render-pipeline changes, no converter suite work.

## Normalized Asset Rules
- Section rules:
  - `palettes` (`type=palette`, `requiresPath=false`)
  - `sprites` (`type=sprite`, `requiresPath=true`)
  - `vectors` (`type=vector`, `requiresPath=true`)
  - `tilesets` (`type=tileset`, `requiresPath=true`)
  - `tilemaps` (`type=tilemap`, `requiresPath=true`)
  - `images` (`type=image`, `requiresPath=true`)
  - `parallaxSources` (`type=parallaxSource`, `requiresPath=true`)
- ID normalization:
  - keep provided ID when valid; otherwise generate via `createAssetId(...)`.
- Path normalization:
  - use `normalizeProjectRelativePath(...)` for all path-required sections.
- Validation:
  - reject unsupported/missing section
  - require normalized ID/type
  - enforce path presence for path-required sections
  - preserve warning when `sourceTool` is empty

## Adapters Added (Minimal)
- Tilemap Studio ingest adapter:
  - `syncAssetRegistryFromDocument` now registers `tilesets` and `tilemaps` through `registerAssetPipelineCandidate(...)`.
- Parallax Scene Studio ingest adapter:
  - `syncAssetRegistryFromDocument` now registers `images` and `parallaxSources` through `registerAssetPipelineCandidate(...)`.
- Sprite Editor ingest adapter:
  - `syncSpriteAssetsToRegistry` now registers `palettes` and `sprites` through `registerAssetPipelineCandidate(...)`.

## Validation
- `npm run test:launch-smoke -- --tools`
  - PASS (`9/9` tools)
- Asset ingest/load verification for touched tools:
  - Confirmed adapter wiring exists in touched ingest paths (`Tilemap`, `Parallax`, `Sprite`).
  - Ran module-level pipeline registration check for touched tool sections:
    - `tilesets`, `tilemaps`, `images`, `parallaxSources`, `palettes`, `sprites`
    - all registrations succeeded and resolved in registry lookup.
  - Result: PASS (no runtime/console regressions observed in smoke run).

## Exact Files Changed
- `tools/shared/assetPipelineFoundation.js`
- `tools/Tilemap Studio/main.js`
- `tools/Parallax Scene Studio/main.js`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `docs/reports/launch_smoke_report.md`
- `docs/reports/BUILD_PR_ASSET_PIPELINE_FOUNDATION_report.md`

## Phase 2 Follow-up Candidates
- optional converter suite stages (out of scope here)
- deeper per-tool import UI harmonization (out of scope here)
