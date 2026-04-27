# BUILD_PR_LEVEL_10_6K_SPRITE_EDITOR_PALETTE_PATH_RESOLUTION_FROM_MANIFEST_V2

## Purpose
Make sprite-editor resolve its required palette path from the sample manifest and fetch the canonical `*.palette.json` file as a hard dependency.

## Scope
- Sprite editor launch/load path only.
- Palette path resolution only.
- Diagnostics may remain in place if already present.
- No repo-wide refactor.
- No start_of_day changes.
- No implementation fallback data.

## Problem Signal
Current diagnostics show:
- sprite-editor receives `samplePresetPath`
- sprite-editor fetches only `sample.0219.sprite-editor.json`
- no palette file is fetched
- classification reports `missing` then `wrong-shape`
- runtime warning says preset payload did not include a sprite project

This means the tool is not resolving all required manifest inputs before loading.

## Required Behavior
Codex must implement the smallest executable change so:

1. The sample manifest is the source of truth for tool input paths.
2. `sprite-editor` requires a palette input.
3. The palette input must resolve to the canonical sample palette file:
   - `samples/**/sample.NNNN.palette.json`
4. The deprecated duplicate wrapper file must not be used:
   - `sample.NNNN.palette-browser.json`
5. If the manifest does not provide a palette path, the tool must fail visibly with a clear diagnostic classification:
   - `missing`
6. If the palette fetch fails, classify it as:
   - `wrong-path`
7. If the fetched palette is not the canonical palette schema, classify it as:
   - `wrong-shape`
8. If the palette is fetched and valid, classify it as:
   - `success`

## Explicit Normalization Rule
Do not pass palette data through a `palette-browser` wrapper.

The loaded palette object must be the canonical object with:
- `schema`
- `version`
- `name`
- `source`
- `swatches`

Allowed metadata:
- `$schema`

Disallowed required shape:
- `tool`
- `config.palette`
- nested palette browser contract

## Expected Diagnostic Evidence
When launching sample `0219` into `sprite-editor`, console logs must show:

- `[tool-load:request]`
  - expected includes required inputs:
    - `spriteProject`
    - `palette`
- `[tool-load:fetch]`
  - one fetch for the sprite-editor preset/project input
  - one fetch for the canonical palette JSON
- `[tool-load:loaded]`
  - loaded sprite input
  - loaded palette input
- `[tool-load:classification]`
  - sprite input classified correctly
  - palette input classified correctly

## Files Codex Should Inspect First
- `samples/phase-02/0219/`
- the sample manifest for 0219
- `tools/sprite-editor/`
- existing tool-load diagnostics utility
- existing sample/tool launch resolver
- any schema or manifest helper already used by other tools

## Guardrails
- Do not add silent fallback palettes.
- Do not hardcode sample 0219.
- Do not infer paths by string replacement unless the manifest already exposes enough data and no resolver exists.
- Do not preserve use of `*.palette-browser.json`.
- Do not change unrelated tools unless the shared resolver must be corrected for sprite-editor to work.
- Do not rewrite roadmap text.
- Roadmap update, if any, must be status-only.

## Acceptance Tests
Run:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

Then manually launch:
- `samples/phase-02/0219` into `sprite-editor`

Confirm:
- palette fetch is visible in browser console
- no `palette-browser` JSON is fetched
- no warning says preset payload did not include a sprite project unless the sprite payload is genuinely invalid
- diagnostics show expected vs actual for both sprite project and palette

## Commit Comment
Resolve sprite-editor palette input from manifest SSoT and require canonical palette fetch - PR 10.6K
