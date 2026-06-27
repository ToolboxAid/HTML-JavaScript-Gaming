# Sample Schema Dependency Map

PR: PR_26152_150-sample-schema-dependency-map
Date: 2026-06-02

## Scope

- Created schema dependency map.
- Mapped sample types to authoritative schema sources.
- Mapped ProjectWorkspace interactions.
- Made no sample JSON changes.

## Dependency Map

| Sample Type | Current Shape | Authoritative Surface | ProjectWorkspace Interaction |
| --- | --- | --- | --- |
| Game/sample manifest | Manifest-like object with game/sample launch metadata | `toolbox/schemas/game.manifest.schema.json` or a future explicitly approved sample manifest schema | Provides `manifestInput`; does not persist ProjectWorkspace runtime state. |
| Tool payload wrapper | `tool`, `version`, `payload` | `toolbox/schemas/samples/sample.tool-payload.schema.json` for legacy wrapper validation; active tool payload schema for payload content | Converted into explicit `toolStateInput` for rebuilt samples. |
| Tool payload content | Tool-specific payload object or array | `toolbox/schemas/tools/<toolId>.schema.json` when active | Saved payload belongs to Tool State, not ProjectWorkspace. |
| Palette data | Standalone `html-js-gaming.palette` document | `toolbox/schemas/tools/palette-browser.schema.json` currently; future rebuild may map to palette-manager/palette browser ownership | ProjectWorkspace may reference active palette context only. |
| Tilemap document | `toolbox.tilemap/1` document | `toolbox/schemas/tools/tile-map-editor.schema.json` for rebuilt tool payload boundary | Tool State owns tilemap payload; manifest references assets/paths. |
| Workspace all-tools sample | `html-js-gaming.project` with missing workspace schema reference | No active workspace schema; must map to game manifest plus explicit ProjectWorkspace handoff, or define an approved replacement first | ProjectWorkspace remains runtime-only coordination. |
| Text to Speech V2 root array | Root array payload | `toolbox/schemas/tools/text2speech-V2.schema.json` | Tool State owns speech queue payload. |

## Wave 1 Dependency Requirements

| Sample JSON | Required Surface | Compatibility Requirement |
| --- | --- | --- |
| `samples/phase-19/1902/sample.1902.workspace-all-tools.json` | No active workspace schema; must resolve to game manifest/tool payload handoff or future schema | Highest dependency risk. |
| `samples/phase-19/1903/sample.1903.text2speech-V2.json` | `toolbox/schemas/tools/text2speech-V2.schema.json` | Low schema risk; add explicit manifest and Tool State handoff in future rebuild. |
| `samples/phase-14/1413/sample.1413.asset-pipeline.json` | `toolbox/schemas/tools/asset-pipeline.schema.json` | Legacy wrapper must map payload to active tool schema. |
| `samples/phase-14/1414/sample.1414.sprite-editor.json` | `toolbox/schemas/tools/sprite-editor.schema.json` | Legacy wrapper must map payload to `spriteProject`. |
| `samples/phase-14/1414/sample.1414.palette.json` | `toolbox/schemas/tools/palette-browser.schema.json` | Palette ownership must be explicit. |
| `samples/phase-12/1208/sample.1208.tile-map-editor.json` | `toolbox/schemas/tools/tile-map-editor.schema.json` | Legacy wrapper must map tilemap fields to active payload boundary. |
| `samples/phase-12/1208/sample.1208.parallax-editor.json` | `toolbox/schemas/tools/parallax-editor.schema.json` | Legacy wrapper must map parallax fields to active payload boundary. |
| `samples/phase-12/1208/sample.1208.palette.json` | `toolbox/schemas/tools/palette-browser.schema.json` | Palette ownership must be explicit. |
| `samples/phase-12/1208/sample.1208.svg-asset-studio.json` | `toolbox/schemas/tools/svg-asset-studio.schema.json` | Map legacy SVG asset sample to current asset/vector ownership decision. |

## ProjectWorkspace Interaction Rules

- ProjectWorkspace consumes explicit manifest and Tool State references.
- ProjectWorkspace does not own sample payload data.
- ProjectWorkspace does not own saved Tool State records.
- Rebuilt samples must not use hidden fallback data, `localStorage`, `sessionStorage`, or runtime render state as source of truth.
- Rebuilt sample image data must use file/path fields, not persisted `imageDataUrl`.

## Validation

Static dependency validation only:

```powershell
node -e "<static schema/sample dependency inventory>"
```

Result: PASS.

## Lanes Executed

- docs/report dependency mapping only.

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

No blocker for static dependency mapping. Wave 1 execution must resolve the `1902` workspace-schema dependency before making it a PASS/FAIL launch target.
