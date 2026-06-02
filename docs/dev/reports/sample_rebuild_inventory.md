# Sample Rebuild Inventory

PR: PR_26152_144-sample-rebuild-inventory
Date: 2026-06-02

## Scope

- Inventoried existing samples.
- Identified sample JSON/schema mismatch categories.
- Marked samples as pending rebuild.
- Did not modify sample JSON.
- Did not run sample launch validation.

## Inventory Sources

- `samples/`
- `tools/schemas/game.manifest.schema.json`
- `tools/schemas/tools/*.schema.json`
- `docs/dev/reports/projectworkspace_migration_closeout.md`

## Sample Inventory

| Area | Count | Status | Notes |
| --- | ---: | --- | --- |
| Sample files under `samples/` | 1579 | INFO | Static file inventory only. |
| Sample directories | 256 | INFO | Directories matching `samples/phase-*/####`. |
| JSON files under `samples/` | 63 | INFO | Static JSON inventory only; no launch validation. |
| Phase groups | 19 | INFO | `phase-01` through `phase-19`. |
| Sample launch validation | 0 | SKIP | Explicitly out of scope for this planning lane. |
| Sample JSON edits | 0 | SKIP | No sample JSON was modified. |

## Static JSON Categories

| Category | Count | Status | Rebuild Need |
| --- | ---: | --- | --- |
| Legacy tool wrapper JSON | 33 | PENDING | Files shaped as `tool` / `version` / `payload` must be rebuilt into approved manifest, Tool State, and ProjectWorkspace handoff boundaries. |
| Standalone palette JSON | 20 | PENDING | Palette data must align with approved palette ownership and explicit project/tool context. |
| Legacy tilemap documents | 6 | PENDING | `toolbox.tilemap/1` documents must be mapped into current Tile Map Editor payload boundaries. |
| Workspace manifest sample | 1 | PENDING | `sample.1902.workspace-all-tools.json` references a workspace manifest schema surface that is not currently present under `tools/schemas/`. |
| Payload root array | 1 | PENDING | Text to Speech V2 payload is schema-shaped but still needs explicit manifest/ProjectWorkspace handoff planning. |
| Metadata/link JSON | 2 | SKIP | Metadata/index support files are not sample payload rebuild targets in this lane. |

## Tool Payload Categories

| Tool / Category | Count | Status | Notes |
| --- | ---: | --- | --- |
| `palette-manager-v2` standalone palette payloads | 20 | PENDING | Needs project ownership and handoff alignment. |
| `tile-map-editor` payloads and documents | 13 | PENDING | Includes legacy wrapper and tilemap document forms. |
| `sprite-editor` payloads | 9 | PENDING | Needs current `spriteProject` payload alignment. |
| `parallax-editor` payloads | 4 | PENDING | Needs current parallax payload alignment. |
| `svg-asset-studio` legacy payloads | 4 | PENDING | Needs current asset/vector ownership mapping decision. |
| `tile-model-converter` legacy payloads | 3 | PENDING | Needs current tool mapping or retirement decision. |
| `vector-map-editor` legacy payloads | 3 | PENDING | Needs current vector/tool mapping decision. |
| `asset-browser` legacy payloads | 2 | PENDING | Needs current asset manager/browser ownership mapping decision. |
| `asset-pipeline` payloads | 1 | PENDING | Needs current asset pipeline payload alignment. |
| `text2speech-V2` payloads | 1 | PENDING | Payload schema exists; handoff boundary remains to be rebuilt. |
| `workspace-manager-v2` project/workspace sample | 1 | PENDING | Needs sample rebuild target decision against current ProjectWorkspace terminology. |

## Mismatch Categories

- Legacy standalone payloads are not yet represented as rebuilt sample manifests with explicit ProjectWorkspace handoff inputs.
- Some samples use retired or renamed tool IDs such as `svg-asset-studio`, `vector-map-editor`, `tile-model-converter`, and `asset-browser`.
- Palette samples are standalone data documents rather than project-owned sample handoff records.
- Tilemap samples mix wrapper JSON and `toolbox.tilemap/1` documents.
- `sample.1902.workspace-all-tools.json` references `tools/schemas/workspace.manifest.schema.json`, but no matching workspace schema file is present in the current schema directory.
- Rebuilt samples must avoid hidden `localStorage`, `sessionStorage`, fallback, or runtime state assumptions.
- Rebuilt image references must use file/path fields such as image names or paths, never persisted `imageDataUrl`.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report inventory only.

## Lanes Skipped

- samples - SKIP / pending rebuild; sample launch validation was not run.
- runtime - no runtime behavior changed.
- integration - no feature integration changed.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. No sample JSON was modified.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blockers for docs-only sample rebuild inventory. Rebuild execution remains future work.
