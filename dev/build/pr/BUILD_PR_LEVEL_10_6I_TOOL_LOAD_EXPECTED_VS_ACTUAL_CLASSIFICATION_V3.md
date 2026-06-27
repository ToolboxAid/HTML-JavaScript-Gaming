# BUILD_PR_LEVEL_10_6I_TOOL_LOAD_EXPECTED_VS_ACTUAL_CLASSIFICATION_V3

## Purpose
Add expected-vs-actual classification to tool-load diagnostics so missing palette requests, wrong paths, wrong payload shapes, and successful loads are visible in browser console output.

## Scope
- Diagnostics only.
- No production contract reshaping.
- No silent fallback data.
- No hardcoded asset paths.
- No start_of_day changes.
- Do not normalize palette files in this PR.

## Required Behavior
Codex must update the existing tool-load diagnostics so each emitted diagnostic event includes a compact `expected` block and a compact `actual` block.

Required event categories:
- `[tool-load:request]`
- `[tool-load:fetch]`
- `[tool-load:loaded]`
- `[tool-load:warning]`
- `[tool-load:classification]`

## Classification Values
Each tool data dependency must classify as exactly one of:
- `missing`
- `wrong-path`
- `wrong-shape`
- `success`

## Expected Block
Each dependency log should include:
- `dependencyId`
- `expectedPathKey`
- `expectedPath`
- `expectedSchema`
- `expectedTopLevelShape`
- `requiredFields`
- `requiredArrayFields`

For palette diagnostics, the expected block must make the palette requirement visible even when no palette fetch occurs.

## Actual Block
Each dependency log should include:
- `requestedPath`
- `fetchUrl`
- `httpStatus`
- `loadedSchema`
- `topLevelKeys`
- `fieldPresence`
- `arrayCounts`

## Palette-Specific Requirement
If a tool expects palette data and no palette path is present in launch query, manifest-derived requested data paths, or normalized input, log:

```text
[tool-load:classification] classification: missing dependencyId: palette
```

The log must state that the expected palette dependency was not requested, not fetched, and not loaded.

## Acceptance
- Running the Sprite Editor sample that currently only fetches `sample.0219.sprite-editor.json` must clearly show whether palette was expected.
- If palette was expected but absent, console output must classify palette as `missing`.
- If preset loads but does not include the expected sprite project shape, classify that dependency as `wrong-shape`.
- Existing smoke/data-flow tests must still run.
- No duplicate palette normalization is performed in this PR.

## Tests
Run:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

Then manually launch the failing tool sample and inspect browser console diagnostics.
