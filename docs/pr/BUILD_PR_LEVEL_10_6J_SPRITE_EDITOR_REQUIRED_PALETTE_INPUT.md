# BUILD_PR_LEVEL_10_6J_SPRITE_EDITOR_REQUIRED_PALETTE_INPUT

## Purpose
Make `sprite-editor` require a palette as an explicit tool input so sample launches show the full expected data contract and fail visibly when palette input is missing.

## Scope
- Target only `sprite-editor` launch/input loading and shared tool-load diagnostics needed for this contract.
- Do not restore `*.palette-browser.json` wrappers.
- Do not introduce fallback palettes or hidden sample paths.
- Do not modify `start_of_day` folders.
- Keep one palette SSoT: `*.palette.json`.

## Problem Evidence
Current logs show:
- `sprite-editor` receives `samplePresetPath`.
- `sprite-editor` fetches only `sample.0219.sprite-editor.json`.
- diagnostics classify initial expected data as `missing`.
- loaded preset is classified `wrong-shape` because the payload did not include the expected sprite project.
- no palette fetch appears in the browser fetch list.

This means the tool boundary does not yet require/resolve palette input as part of its expected contract.

## Codex Tasks
1. Locate the smallest `sprite-editor` launch/input path that reads query or manifest data into the tool.
2. Add `palettePath` / canonical palette input to the expected data contract for `sprite-editor`.
3. Require palette resolution from manifest/tool launch input, not from hardcoded sample paths.
4. Fetch the canonical `*.palette.json` when present in requested data paths.
5. Log diagnostics for palette at request, fetch, loaded, and classification stages.
6. If palette is missing, classify as `missing` and show a clear visible warning/error.
7. If palette is fetched but malformed, classify as `wrong-shape` with top-level keys.
8. If palette is valid, classify as `success` and include swatch count in diagnostics.
9. Preserve existing behavior for valid sprite project loading except for requiring palette.
10. Update the Level 10.6 report with execution results only.
11. Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status markers only if execution-backed.

## Acceptance
- Launching sample 0219 into `sprite-editor` logs an expected palette requirement.
- Browser fetch list includes the canonical sample palette JSON when the sample manifest provides it.
- Missing palette is not silent.
- No duplicate `*.palette-browser.json` files are created or required.
- No fallback palette data is used.
- `npm run test:sample-standalone:data-flow` passes or reports only explicit classified failures.
- Roadmap change, if any, is status-only.

## Validation Commands
Run:
```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

Then manually launch:
```text
samples/phase-02/0219
```
Open sprite-editor and confirm console diagnostics include palette expected/fetch/loaded/classification.
