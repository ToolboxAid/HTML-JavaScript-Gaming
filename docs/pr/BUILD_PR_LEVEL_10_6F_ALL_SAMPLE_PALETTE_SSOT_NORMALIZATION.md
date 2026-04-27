# BUILD_PR_LEVEL_10_6F_ALL_SAMPLE_PALETTE_SSOT_NORMALIZATION

## Purpose
Normalize every duplicate sample palette pair under `samples/` to a single canonical palette source of truth.

Known pattern:
- `sample.NNNN.palette.json` contains the canonical palette object.
- `sample.NNNN.palette-browser.json` duplicates the same palette under a Palette Browser tool wrapper.

This PR applies the normalization to all matching samples, not just sample 0313.

## Scope
- Search only under `samples/` and directly related sample metadata/test files needed to keep validation green.
- Keep canonical `*.palette.json` as the only persisted palette JSON for each sample.
- Remove/de-reference duplicate `*.palette-browser.json` files.
- Update sample manifests/metadata/tool bindings so Palette Browser receives the canonical palette object from the sample manifest/normalized input path.
- Update roadmap status markers only if execution-backed.

## Do Not
- Do not keep both palette files for the same sample.
- Do not introduce a new persisted wrapper schema for Palette Browser.
- Do not transform canonical palettes into `$schema`, `engine.paletteList`, `config.palette`, or another tool-specific persisted wrapper.
- Do not add silent fallback palettes or hardcoded sample asset paths.
- Do not modify `start_of_day` folders.
- Do not do a repo-wide refactor.

## Required Normalization Rules

### Canonical persisted palette
For each sample, the only persisted palette JSON must be:

```text
samples/**/sample.*.palette.json
```

This file owns the palette fields:

```text
schema
version
name
source
swatches
```

Preserve an existing `$schema` in the canonical file unless an existing schema/test contract explicitly requires removal.

### Browser wrapper removal
Remove or de-reference every duplicate file matching:

```text
samples/**/sample.*.palette-browser.json
```

Palette Browser must not depend on a persisted wrapper like:

```json
{
  "tool": "palette-browser",
  "config": {
    "palette": {}
  }
}
```

### Runtime input contract
Palette Browser may receive a runtime envelope only if the existing runner requires one, but that envelope must be built by the runner/normalizer from the canonical palette object. It must not be stored as a second sample JSON file.

### No fallback data
If a sample has no palette input, Palette Browser must show a safe empty state. It must not auto-load hidden/default/sample palettes.

## Codex Targeted Discovery
Run:

```powershell
Get-ChildItem .\samples -Recurse -Filter "*.palette-browser.json" | Select-Object -ExpandProperty FullName
Get-ChildItem .\samples -Recurse -Filter "*.palette.json" | Select-Object -ExpandProperty FullName
Select-String -Path .\samples\**\*.json -Pattern "palette-browser|palette.json|config.palette|paletteList" -List
Select-String -Path .\tests\**\*.mjs,.\samples\metadata\*.json -Pattern "palette-browser|palette.json|config.palette|paletteList" -List
```

## Implementation Steps
1. Inventory every `samples/**/sample.*.palette-browser.json` file.
2. Match each wrapper file to its sibling or referenced `sample.*.palette.json`.
3. Compare `wrapper.config.palette` to the canonical palette object.
4. If the content is the same palette with only wrapper/source/schema drift, keep canonical `*.palette.json` and remove the wrapper file.
5. Update all sample metadata/manifest/tool references that point to `*.palette-browser.json` so they point to canonical `*.palette.json` or manifest palette data.
6. Update sample standalone normalizer/test expectations only if they currently require persisted wrapper files.
7. Ensure the flow remains: `sample -> schema -> normalized input -> tool -> UI/state`.
8. Generate a report listing each removed wrapper and each updated reference.
9. Run required tests and place outputs under `docs/dev/reports/`.

## Required Tests

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

## Required Report
Create:

```text
docs/dev/reports/level_10_6f_all_sample_palette_ssot_normalization_report.md
```

It must include:

```text
Palette browser wrapper files found: N
Palette browser wrapper files removed: N
Canonical palette files retained: N
References updated: N
Generic failure signals detected: X
```

Also include:

```text
sample | removed palette-browser file | canonical palette file | updated references | validation result
```

## Acceptance
- No `samples/**/sample.*.palette-browser.json` duplicate files remain unless listed as blocked with a concrete reason.
- No sample metadata points to a palette-browser JSON wrapper as the palette source.
- Palette Browser uses the canonical palette object from manifest/normalized input.
- `npm run test:launch-smoke:games` passes.
- `npm run test:sample-standalone:data-flow` passes.
- Report shows `Generic failure signals detected: 0`.
