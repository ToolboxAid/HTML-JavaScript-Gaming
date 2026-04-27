# BUILD_PR_LEVEL_10_6H_TOOL_LOAD_EXPECTED_DIAGNOSTICS

## Purpose
Add explicit `expected` contract diagnostics to the existing tool-load logging so each tool log shows what the launcher/tool expected to receive, fetch, and load.

## Scope
- Extend the existing diagnostics added in Level 10.6G only.
- Apply to every tool using the shared tool-load diagnostics helper.
- Do not change sample contracts, palette schema, or runtime data normalization in this PR.
- Do not add fallback data.
- Do not hardcode sample asset paths.
- Do not modify `start_of_day` folders.

## Problem
Current logs show:
- request
- fetch attempt/response
- loaded payload
- warnings

But they do not show the expected shape/path/source, so failures still require guessing whether the launcher requested the wrong file, the tool fetched the wrong file, or the fetched payload lacked the tool-required contract.

Example current warning:

```text
[tool-load:warning] Preset payload did not include a sprite project.
```

The log needs to include the expected contract at the same boundary.

## Required Change
Update the shared diagnostics utility and each calling tool so logs include an `expected` object where applicable.

### Required log shape

#### request
```js
{
  toolId,
  sampleId,
  samplePresetPath,
  requestedDataPaths,
  launchQuery,
  expected: {
    inputSource: "query.samplePresetPath | query.dataPath | manifest tool input | none",
    requiredPaths: [],
    requiredPayloadShape: [],
    optionalPayloadShape: []
  }
}
```

#### fetch attempt / response
```js
{
  toolId,
  phase,
  fetchUrl,
  requestedPath,
  pathSource,
  expected: {
    pathKind: "sample preset | palette | manifest | asset | unknown",
    mustExist: true,
    contentType: "json | text | image | unknown",
    payloadContract: []
  }
}
```

#### loaded
```js
{
  toolId,
  sampleId,
  samplePresetPath,
  fetchUrl,
  loaded,
  expected: {
    requiredPayloadShape: [],
    detectedPayloadShape: [],
    missingRequiredFields: [],
    contractMatch: true | false
  }
}
```

#### warning/error
```js
{
  toolId,
  sampleId,
  samplePresetPath,
  error,
  expected: {
    requiredPayloadShape: [],
    receivedTopLevelKeys: [],
    likelyCause: "wrong path | wrong wrapper | missing field | invalid json | unknown"
  }
}
```

## Sprite Editor Mandatory Expected Contract
For sprite-editor preset loading, expected diagnostics must explicitly show:

```js
expected: {
  pathKind: "sample preset",
  contentType: "json",
  requiredPayloadShape: ["spriteProject"],
  optionalPayloadShape: ["palette", "metadata", "sprites"],
  contractMatch: false when `spriteProject` is missing
}
```

If the loaded payload top-level keys do not include `spriteProject`, the warning must include:

```js
receivedTopLevelKeys: Object.keys(payload)
missingRequiredFields: ["spriteProject"]
likelyCause: "wrong path or wrong wrapper"
```

## Palette Expected Contract
For palette-capable tools, expected diagnostics must distinguish:

- canonical palette file expected:
  - schema: `html-js-gaming.palette`
  - required fields: `schema`, `version`, `name`, `swatches`
- tool wrapper not expected as canonical palette:
  - `tool`
  - `config.palette`

The diagnostic should make it obvious when a tool fetched a `*.palette-browser.json` wrapper instead of a `*.palette.json` canonical palette.

## Acceptance Criteria
- Browser console logs include `expected` for request, fetch, loaded, warning, and error diagnostics where relevant.
- Sprite editor warning includes expected required payload shape and received top-level keys.
- Palette diagnostics identify canonical palette versus tool wrapper.
- Existing launch smoke tests still pass.
- Existing sample standalone data-flow test still runs.
- No silent fallback data is added.
- No hardcoded asset paths are added.

## Validation Commands
```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

## Report Required
Codex must write:

```text
docs/dev/reports/level_10_6H_tool_load_expected_diagnostics_report.md
```

Include:
- files changed
- before/after example log object for sprite-editor sample 0219
- whether `expected.contractMatch` is false for the current missing `spriteProject` case
- validation command results
