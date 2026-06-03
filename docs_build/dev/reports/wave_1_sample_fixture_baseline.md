# Wave 1 Sample Fixture Baseline

PR: PR_26152_154-wave-1-sample-fixture-baseline
Date: 2026-06-02

## Scope

- Established Wave 1 sample fixture inventory.
- Identified exact sample inputs and manifests.
- Identified authoritative schemas for each selected sample.
- Did not run sample launch validation.
- Did not perform broad sample conversion.

## Wave 1 Fixture Set

| Group | Sample JSON | Current Shape | Current Schema Reference | Authoritative Surface |
| --- | --- | --- | --- | --- |
| A | `samples/phase-19/1903/sample.1903.text2speech-V2.json` | Root array payload | none | `toolbox/schemas/tools/text2speech-V2.schema.json` |
| B | `samples/phase-14/1413/sample.1413.asset-pipeline.json` | Legacy `tool` / `version` / `payload` wrapper | none | `toolbox/schemas/tools/asset-pipeline.schema.json` plus Tool State boundary |
| C | `samples/phase-14/1414/sample.1414.sprite-editor.json` | Legacy `tool` / `version` / `payload` wrapper | none | `toolbox/schemas/tools/sprite-editor.schema.json` plus Tool State boundary |
| C | `samples/phase-14/1414/sample.1414.palette.json` | Standalone palette document | `../../../toolbox/schemas/tools/palette-browser.schema.json` | `toolbox/schemas/tools/palette-browser.schema.json` plus palette ownership boundary |
| D | `samples/phase-12/1208/sample.1208.tile-map-editor.json` | Legacy `tool` / `version` / `payload` wrapper | none | `toolbox/schemas/tools/tile-map-editor.schema.json` plus Tool State boundary |
| D | `samples/phase-12/1208/sample.1208.parallax-editor.json` | Legacy `tool` / `version` / `payload` wrapper | none | `toolbox/schemas/tools/parallax-editor.schema.json` plus Tool State boundary |
| D | `samples/phase-12/1208/sample.1208.palette.json` | Standalone palette document | `../../../toolbox/schemas/tools/palette-browser.schema.json` | `toolbox/schemas/tools/palette-browser.schema.json` plus palette ownership boundary |
| D | `samples/phase-12/1208/sample.1208.svg-asset-studio.json` | Legacy `tool` / `version` / `payload` wrapper | none | `toolbox/schemas/tools/svg-asset-studio.schema.json` plus asset/vector ownership boundary |
| E | `samples/phase-19/1902/sample.1902.workspace-all-tools.json` | Workspace-manifest-like sample | `../../../toolbox/schemas/workspace.manifest.schema.json` | No active workspace schema; must align to `game.manifest.schema.json`, Tool State, and ProjectWorkspace contracts or receive an approved replacement surface |

## Exact Sample Inputs

- Group A: `samples/phase-19/1903`
- Group B: `samples/phase-14/1413`
- Group C: `samples/phase-14/1414`
- Group D: `samples/phase-12/1208`
- Group E: `samples/phase-19/1902`

## Manifest Baseline

- No Wave 1 target currently has a fully aligned rebuilt sample manifest.
- `samples/phase-19/1902/sample.1902.workspace-all-tools.json` is manifest-like, but references a missing workspace schema and must not be treated as authoritative.
- Future rebuilt samples must provide explicit manifest input and explicit Tool State input for ProjectWorkspace handoff.

## Validation

Static fixture discovery:

```powershell
node -e "<Wave 1 target fixture inventory>"
```

Result: PASS.

## Lanes Executed

- docs/report fixture baseline only.

## Lanes Skipped

- samples - no sample JSON changes and no sample launch validation.
- runtime - no runtime behavior changed.
- tool runtime validation - not run.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

Unrebuilt samples remain SKIP / pending rebuild. Only Wave 1 samples listed above are in scope for future execution PRs.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blocker for static fixture baseline. Group E is dependency-gated by the missing workspace schema assumption.
