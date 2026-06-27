# Sample Rebuild Wave 1 Scope

PR: PR_26152_146-sample-rebuild-wave-1-scope
Date: 2026-06-02

## Scope

- Defined Sample Rebuild Wave 1 scope.
- Identified exact samples for the first rebuild wave.
- Defined expected validation for rebuilt samples only.
- Did not rebuild samples.

## Wave 1 Sample Set

| Sample | Current Payload Coverage | Reason |
| --- | --- | --- |
| `samples/phase-19/1902` | Workspace all-tools sample | Starts with the most ProjectWorkspace-relevant sample and resolves missing workspace schema/reference direction first. |
| `samples/phase-19/1903` | Text to Speech V2 payload | Small schema-shaped root array payload; good first low-risk handoff sample. |
| `samples/phase-14/1413` | Asset Pipeline payload | Covers asset pipeline payload ownership without broad sample tree churn. |
| `samples/phase-14/1414` | Sprite Editor plus palette payloads | Covers sprite/palette relationship and current `spriteProject` target alignment. |
| `samples/phase-12/1208` | Tile Map Editor, Parallax Editor, palette, and legacy SVG asset payloads | Covers the highest-value multi-tool sample with tile/parallax/asset boundaries. |

## Wave 1 Exact JSON Targets

- `samples/phase-19/1902/sample.1902.workspace-all-tools.json`
- `samples/phase-19/1903/sample.1903.text2speech-V2.json`
- `samples/phase-14/1413/sample.1413.asset-pipeline.json`
- `samples/phase-14/1414/sample.1414.sprite-editor.json`
- `samples/phase-14/1414/sample.1414.palette.json`
- `samples/phase-12/1208/sample.1208.tile-map-editor.json`
- `samples/phase-12/1208/sample.1208.parallax-editor.json`
- `samples/phase-12/1208/sample.1208.palette.json`
- `samples/phase-12/1208/sample.1208.svg-asset-studio.json`

## Expected Future Validation For Rebuilt Samples Only

| Validation | Applies When | Result Rule |
| --- | --- | --- |
| Static JSON parse | After rebuild modifies a sample JSON file | PASS/FAIL for rebuilt file only. |
| Schema validation | After target schema mapping is implemented or selected | PASS/FAIL for rebuilt file only. |
| ProjectWorkspace launch boundary | After rebuilt sample defines explicit launch handoff | PASS/FAIL for rebuilt sample only. |
| Tool State boundary | After rebuilt sample defines Tool State payload | PASS/FAIL for rebuilt sample only. |
| Sample launch smoke | Future execution PR only | PASS/FAIL for rebuilt sample only; unrebuild samples remain SKIP. |

## Out Of Scope

- No sample JSON changes.
- No sample launch validation.
- No full sample tree validation.
- No runtime implementation.
- No broad sample migration.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report Wave 1 sample scope only.

## Lanes Skipped

- samples - SKIP / pending rebuild; sample launch validation was not run.
- runtime - no runtime behavior changed.
- integration - no feature integration changed.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. No sample JSON was modified. Only the exact Wave 1 sample set listed above should become active validation targets in future rebuild PRs.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blockers for docs-only Wave 1 sample rebuild scoping.
