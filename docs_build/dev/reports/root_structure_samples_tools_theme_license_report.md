# PR_26154_004 Root Structure, Samples, Tools, Theme, License Report

## Summary

Completed the scoped root-structure cleanup for `PR_26154_004-root-structure-samples-tools-theme-license`.

- Renamed `samples/` to `old_samples/` and marked it as deprecated reference content.
- Created the new `games/` surface and moved `arcade/` to `games/arcade/`.
- Added `games/index.html` plus concise placeholder game-type pages for `action`, `adventure`, `puzzle`, `racing`, `retro`, and `strategy`.
- Moved `cloud/` to `tools/cloud/`.
- Moved confirmed legacy tool folders/files into `old-tools/`.
- Preserved active tool infrastructure in `tools/` when required by current scripts, tests, or first-class tool surfaces.
- Created `assets/theme/v1/` as the legacy Theme V1 location marker.
- Replaced the permissive `LICENSE` with a restrictive proprietary notice and changed `package.json` license metadata to `UNLICENSED`.

## Moved Public Surfaces

- `samples/` -> `old_samples/`
- `arcade/` -> `games/arcade/`
- `cloud/` -> `tools/cloud/`

`samples/` and some legacy tool moves required copy/remove fallback after Windows `rename` returned `EPERM`; copied file counts were verified before removing the obsolete source folders.

## New Games Surface

Added:

- `games/index.html`
- `games/action/index.html`
- `games/adventure/index.html`
- `games/puzzle/index.html`
- `games/racing/index.html`
- `games/retro/index.html`
- `games/strategy/index.html`

`games/index.html` provides game-type tiles, a search input, a type filter select, and links to the game-type folders. Existing Theme V2 CSS and assets are reused; no new CSS was authored.

## Deprecated Tools Moved

Moved to `old-tools/` after active-reference review:

- `tools/old_3D Asset Viewer/`
- `tools/old_3D Camera Path Editor/`
- `tools/old_3D JSON Payload/`
- `tools/old_Asset Pipeline/`
- `tools/old_Parallax Scene Studio/`
- `tools/old_Performance Profiler/`
- `tools/old_Physics Sandbox/`
- `tools/old_Replay Visualizer/`
- `tools/old_Sprite Editor/`
- `tools/old_State Inspector/`
- `tools/old_Tilemap Studio/`
- `tools/old_asset-manager-v2/`
- `tools/old_audio-sfx-playground-v2/`
- `tools/old_collision-inspector-v2/`
- `tools/old_input-mapping-v2/`
- `tools/old_localization-studio/`
- `tools/old_midi-studio-v2/`
- `tools/old_object-vector-studio-v2/`
- `tools/old_palette-manager-v2/`
- `tools/old_preview-generator-v2/`
- `tools/old_storage-inspector-v2/`
- `tools/old_text2speech-V2/`
- `tools/old_workspace-manager-v2/`
- `tools/old_world-vector-studio-v2/`
- `tools/_templates-v2_deprecated/`
- `tools/codex/`
- `tools/common/`

## Tool Items Not Moved

The following listed items remain in `tools/` because they are still active:

- `tools/_templates-v2/`: active future-state Tool Template; covered by Workspace V2 root tools validation.
- `tools/dev/`: active guard and validation scripts are invoked from `package.json`.
- `tools/shared/`: active shared tool runtime helpers and preview utilities.
- `tools/renderToolsIndex.js`: active tools index generation/runtime helper.
- `tools/toolRegistry.js`: active registry file; paths were rewired to point deprecated entries at `old-tools/`.

## Path Rewrites

Updated active references for the moved surfaces:

- Root home links now target `games/index.html` instead of `arcade/index.html`.
- Theme V2 route map, root segment detection, header, footer, and tools-page accordion links now use `games/...` and `tools/cloud/...`.
- `tools/cloud/index.html` and `games/arcade/index.html` use the correct deeper relative Theme V2 asset/script paths.
- Active old sample consumers now point to `old_samples/...`.
- Deprecated legacy tool registry entries now point to `../old-tools/...`.
- Runtime/sample helper scripts route old sample references to `old_samples/...`.
- Node test aliases no longer expose `/samples/`.
- Active sample lanes/tests were retired from automated execution.

## Theme V1 and Theme V2

Created `assets/theme/v1/README.md`.

No files were moved into `assets/theme/v1/` because the repository did not contain legacy files directly under `assets/theme/` at the time of this PR.

`src/engine/theme/` was not moved. Current evidence shows it contains mixed responsibilities:

- `src/engine/theme/v2/assets/` is the public Theme V2 styling, partial, image, and script surface used by public pages and tools.
- sibling files under `src/engine/theme/` and `src/engine/ui/` act more like runtime/engine shell helpers and shared header integrations.

Recommended follow-up: split or explicitly document public Theme V2 SSoT versus runtime engine shell styling before moving any `src/engine/theme/` content.

## License

`LICENSE` now contains a restrictive proprietary license notice for privately owned source. `package.json` now uses `UNLICENSED`.

## Deprecated Test Handling

- `old_samples/` remains playable reference content.
- `samples` lane now compiles with no targets and no commands.
- `npm run test:lane:samples` confirms `old_samples` is excluded from active automated validation with zero browser launches.
- Existing `old_games` skip behavior remains unchanged.

## Validation

Passed:

- Targeted path validation for moved pages, required/obsolete folders, Theme V2 route map targets, and partial assets.
- Active changed-file static validation: `js=32`, `json=4`, `html=16`, `markdown=4`.
- `node --check scripts/write-codex-review-artifacts.mjs`
- `node --check scripts/skip-deprecated-sample-tests.mjs`
- `node tools/dev/checkSharedExtractionGuard.mjs`
- `node tools/dev/checkStyleSystemGuard.mjs`
- `npm run test:workspace-v2` with 2 Playwright checks passing.
- `npm run test:lane:samples` with `samples` lane passing through zero commands and zero browser launches.

Warnings:

- Historical docs under `docs_build/`, protected `start_of_day` material, retired tests, and deprecated `old-tools/` content still contain old `samples/` or legacy tool-path text as preserved history/reference content.
- `tools/_templates-v2/`, `tools/dev/`, `tools/shared/`, `tools/renderToolsIndex.js`, and `tools/toolRegistry.js` were intentionally not moved because active references still require them.
- A non-required `checkPhase24CloseoutExecutionGuard` run reported roadmap hash drift in `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`; there is no working-tree diff for that roadmap file in this PR.

