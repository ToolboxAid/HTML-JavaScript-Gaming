# Sample Schema Discovery

PR: PR_26152_149-sample-schema-discovery
Date: 2026-06-02

## Scope

- Discovered actual schema ownership surfaces.
- Inventoried `game.manifest.schema.json` usage.
- Inventoried tool schema usage.
- Documented missing assumed schemas.
- Made no sample JSON changes.

## Active Schema Surfaces

| Surface | Count | Status | Notes |
| --- | ---: | --- | --- |
| `toolbox/schemas/game.manifest.schema.json` | 1 | PRESENT | Active game manifest schema and current manifest ownership surface. |
| `toolbox/schemas/tools/*.schema.json` | 22 | PRESENT | Active per-tool payload schema surface. |
| `toolbox/schemas/samples/sample.tool-payload.schema.json` | 1 | PRESENT | Active legacy/sample tool payload wrapper schema surface. |
| `toolbox/schemas/workspace.schema.json` | 0 | MISSING | Not an active schema surface. Do not assume it exists. |
| `toolbox/schemas/workspace.manifest.schema.json` | 0 | MISSING | Referenced historically and by one sample, but not present as an active schema file. |

## Game Manifest Schema Usage

`toolbox/schemas/game.manifest.schema.json` is the active schema for game manifest ownership. Its `tools` map currently defines these governed tool payload keys:

- `asset-manager-v2`
- `audio-sfx-playground-v2`
- `input-mapping-v2`
- `midi-studio-v2`
- `object-vector-studio-v2`
- `palette-manager-v2`
- `text2speech-V2`

Current active code references include:

- `toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `toolbox/_tool_template-v2/starter-project-template/config/starter.game.manifest.json`

## Tool Schema Usage

Active tool schema files discovered under `toolbox/schemas/tools/`:

- `3d-asset-viewer.schema.json`
- `3d-camera-path-editor.schema.json`
- `3d-json-payload.schema.json`
- `asset-manager-v2.schema.json`
- `asset-pipeline.schema.json`
- `audio-sfx-playground-v2.schema.json`
- `collision-inspector-v2.schema.json`
- `input-mapping-v2.schema.json`
- `midi-studio-v2.schema.json`
- `object-vector-studio-v2.schema.json`
- `palette-browser.schema.json`
- `palette-manager-v2.schema.json`
- `parallax-editor.schema.json`
- `performance-profiler.schema.json`
- `physics-sandbox.schema.json`
- `replay-visualizer.schema.json`
- `sprite-editor.schema.json`
- `state-inspector.schema.json`
- `svg-asset-studio.schema.json`
- `text2speech-V2.schema.json`
- `tile-map-editor.schema.json`
- `vector-map-editor.schema.json`

## Sample Schema References

Static sample JSON inventory found 63 sample JSON files:

| Sample `$schema` Reference | Count | Status |
| --- | ---: | --- |
| No `$schema` | 35 | PENDING rebuild or explicit wrapper mapping. |
| `../../../toolbox/schemas/tools/palette-browser.schema.json` | 17 | PRESENT. |
| `../../../toolbox/schemas/samples/sample.tool-payload.schema.json` | 6 | PRESENT. |
| `../../../toolbox/schemas/palette.schema.json` | 3 | MISSING active schema. |
| `../../../toolbox/schemas/workspace.manifest.schema.json` | 1 | MISSING active schema. |
| `../../toolbox/schemas/samples/sample.tool-payload.schema.json` | 1 | PRESENT. |

## Missing Assumed Schemas

| Assumed Schema | Exists | Action |
| --- | --- | --- |
| `toolbox/schemas/workspace.schema.json` | No | Eliminate as a planning assumption. |
| `toolbox/schemas/workspace.manifest.schema.json` | No | Do not use as authoritative until a future PR explicitly recreates or replaces it. |
| `toolbox/schemas/tools/tile-model-converter.schema.json` | No | Map or retire legacy sample references before rebuild. |
| `toolbox/schemas/tools/asset-browser.schema.json` | No | Map or retire legacy sample references before rebuild. |

## Validation

Static schema discovery only:

```powershell
rg --files toolbox/schemas
rg -n "workspace\.schema|workspace\.manifest|game\.manifest\.schema|tools/schemas" samples tools docs_build/dev/reports
node -e "<static schema/sample inventory>"
```

Result: PASS.

## Lanes Executed

- docs/report schema discovery only.

## Lanes Skipped

- samples - no sample JSON changes and no sample launch validation.
- runtime - no runtime behavior changed.
- tool runtime validation - not run.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. Rebuilt samples remain future work.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blocker for discovery. The missing workspace schema is a planning constraint, not a change in this PR.
