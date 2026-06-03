# PR_26130_029-tools-index-cleanup-and-text-to-speech-count

## Summary
- Removed the planned `Character Voice Presets` and `Game Character Voice / Event Integration` cards from `toolbox/index.html`.
- Hid `Asset Browser / Import Hub` and `Tile Model Converter` from the generated tools index surface without deleting their runtime folders or changing broader registry visibility.
- Replaced the Workspace Manager V2 Text to Speech V2 tile detail from `Speech synthesis ready.` to a live `N text to speech` count.
- Threaded the existing Text to Speech V2 session summary count into Workspace Manager V2 tool tile rendering.
- Added Playwright coverage that locks Session Inspector V2 How To Use and Read Me buttons to the same shared tools-index action class pattern used by Palette Manager V2.

## Scope Notes
- Scope was limited to `toolbox/index.html`, the tools index renderer, Workspace Manager V2 tile count display, and direct Playwright coverage.
- Runtime folders for `toolbox/asset-browser` and `toolbox/tile-model-converter` were not deleted.
- No start_of_day changes.
- Full samples smoke test was not run. Reason: this PR is limited to tools index cleanup and Workspace Manager V2 tile display; the requested `npm run test:workspace-v2` suite covers the scoped behavior.

## Validation
- First run: `npm run test:workspace-v2` timed out at the command timeout before completion.
- Final run: `npm run test:workspace-v2`
- Result: 36 passed.
- Playwright V8 coverage report included changed runtime JS coverage:
  - `(100%) toolbox/renderToolsIndex.js - executed lines 180/180; executed functions 28/28`
  - `(86%) toolbox/workspace-manager-v2/js/WorkspaceManagerV2App.js - executed lines 940/940; executed functions 42/49`
  - `(93%) toolbox/workspace-manager-v2/js/controls/ToolTilesControl.js - executed lines 126/126; executed functions 14/15`

## Artifacts
- Diff report: `docs_build/dev/reports/codex_review.diff`
- Changed files report: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26130_029-tools-index-cleanup-and-text-to-speech-count_delta.zip`
