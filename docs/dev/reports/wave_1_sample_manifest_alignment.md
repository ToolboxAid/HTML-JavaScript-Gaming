# Wave 1 Sample Manifest Alignment

PR: PR_26152_155-wave-1-sample-manifest-alignment
Date: 2026-06-02

## Scope

- Documented required manifest alignment changes for Wave 1 samples.
- Identified schema gaps.
- Identified ProjectWorkspace interactions.
- Did not modify samples outside Wave 1 scope.

## Required Manifest Alignment

| Group | Sample | Required Alignment |
| --- | --- | --- |
| A | `samples/phase-19/1903` | Wrap Text to Speech V2 payload in explicit sample manifest and Tool State handoff; preserve root-array payload validity. |
| B | `samples/phase-14/1413` | Convert Asset Pipeline legacy wrapper into explicit Tool State payload and manifest asset/project references. |
| C | `samples/phase-14/1414` | Convert Sprite Editor wrapper to current `spriteProject` payload; link palette as explicit palette/asset context. |
| D | `samples/phase-12/1208` | Convert tile, parallax, palette, and SVG asset payloads into coordinated manifest and Tool State references. |
| E | `samples/phase-19/1902` | Remove dependency on missing `workspace.manifest.schema.json`; align to active manifest/tool payload/ProjectWorkspace surfaces before launch validation. |

## Schema Gaps

| Gap | Status | Required Decision |
| --- | --- | --- |
| `tools/schemas/workspace.manifest.schema.json` referenced by `sample.1902.workspace-all-tools.json` | Missing | Replace with active authoritative surfaces or create an explicitly approved replacement in a future PR. |
| `tools/schemas/workspace.schema.json` | Missing | Must not be assumed. |
| `game.manifest.schema.json` currently omits `tile-map-editor`, `parallax-editor`, `sprite-editor`, `asset-pipeline`, and `svg-asset-studio` from root `tools` map | Known limitation | Use Tool State payload validation directly, or add explicitly approved manifest schema support in future execution. |
| Legacy wrapper samples with no `$schema` | Pending rebuild | Convert or validate via selected target wrapper/schema path in future execution. |

## ProjectWorkspace Interactions

- ProjectWorkspace receives explicit `manifestInput`.
- ProjectWorkspace receives explicit `toolStateInput`.
- ProjectWorkspace does not persist sample payloads.
- ProjectWorkspace does not own saved Tool State records.
- Rebuilt samples must not depend on `localStorage`, `sessionStorage`, fallback data, hidden bootstrap data, or runtime render state.
- Image data must use file/path fields, not persisted `imageDataUrl`.

## Validation

Static manifest alignment review:

```powershell
node -e "<Wave 1 manifest/schema alignment assertions>"
```

Result: PASS.

## Lanes Executed

- docs/report manifest alignment review only.

## Lanes Skipped

- samples - no sample JSON changes and no sample launch validation.
- runtime - no runtime behavior changed.
- tool runtime validation - not run.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

Wave 1 samples are pending rebuild. Unrebuilt samples remain SKIP.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blocker for static manifest alignment review. Future execution must resolve whether Group E is rebuilt after, or separately from, the missing workspace schema decision.
