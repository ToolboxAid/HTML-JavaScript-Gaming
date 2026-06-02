# Sample Rebuild Wave 1 Targets

PR: PR_26152_151-sample-rebuild-wave-1-targets
Date: 2026-06-02

## Scope

- Refined Wave 1 sample rebuild targets.
- Grouped targets by schema compatibility requirements.
- Grouped targets by rebuild complexity.
- Made no sample JSON changes.

## Refined Wave 1 Target Groups

| Group | Samples | Complexity | Reason |
| --- | --- | --- | --- |
| A - Low schema friction | `samples/phase-19/1903` | Low | Text to Speech V2 already has an active root-array payload schema. |
| B - Single-tool wrapper rebuild | `samples/phase-14/1413` | Medium | Asset Pipeline payload needs wrapper-to-tool-payload mapping. |
| C - Paired payload rebuild | `samples/phase-14/1414` | Medium | Sprite Editor and palette payloads need explicit relationship and ownership boundaries. |
| D - Multi-tool payload rebuild | `samples/phase-12/1208` | High | Tilemap, parallax, palette, and SVG asset payloads need coordinated manifest/toolState mapping. |
| E - Workspace dependency resolution | `samples/phase-19/1902` | Highest | Current sample references missing `workspace.manifest.schema.json`; must resolve authoritative surface before rebuild. |

## Exact Wave 1 JSON Targets

| Target | Group | Current Schema State |
| --- | --- | --- |
| `samples/phase-19/1903/sample.1903.text2speech-V2.json` | A | No `$schema`; payload matches active Text to Speech V2 root-array direction. |
| `samples/phase-14/1413/sample.1413.asset-pipeline.json` | B | Legacy wrapper with no `$schema`. |
| `samples/phase-14/1414/sample.1414.sprite-editor.json` | C | Legacy wrapper with no `$schema`. |
| `samples/phase-14/1414/sample.1414.palette.json` | C | Existing `palette-browser.schema.json` reference. |
| `samples/phase-12/1208/sample.1208.tile-map-editor.json` | D | Legacy wrapper with no `$schema`. |
| `samples/phase-12/1208/sample.1208.parallax-editor.json` | D | Legacy wrapper with no `$schema`. |
| `samples/phase-12/1208/sample.1208.palette.json` | D | Existing `palette-browser.schema.json` reference. |
| `samples/phase-12/1208/sample.1208.svg-asset-studio.json` | D | Legacy wrapper with no `$schema`. |
| `samples/phase-19/1902/sample.1902.workspace-all-tools.json` | E | References missing `workspace.manifest.schema.json`. |

## Recommended Execution Order

1. Rebuild `samples/phase-19/1903` first to prove root-array payload handoff.
2. Rebuild `samples/phase-14/1413` to prove single-tool wrapper conversion.
3. Rebuild `samples/phase-14/1414` to prove sprite plus palette relationship.
4. Rebuild `samples/phase-12/1208` to prove coordinated multi-tool sample payloads.
5. Rebuild or split `samples/phase-19/1902` only after the missing workspace schema assumption is removed or replaced.

## Validation

Static planning validation only:

```powershell
node -e "<static Wave 1 target inventory>"
```

Result: PASS.

## Lanes Executed

- docs/report Wave 1 target planning only.

## Lanes Skipped

- samples - no sample JSON changes and no sample launch validation.
- runtime - no runtime behavior changed.
- tool runtime validation - not run.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. Wave 1 targets become validation targets only in future rebuild execution PRs.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blocker for static target planning. `samples/phase-19/1902` remains the highest dependency risk.
