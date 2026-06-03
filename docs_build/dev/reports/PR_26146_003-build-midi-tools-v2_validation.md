# PR_26146_003-build-midi-tools-v2 Validation

## Changed Files

- `toolbox/midi-studio-v2/index.html`
- `toolbox/midi-studio-v2/README.md`
- `toolbox/midi-studio-v2/styles/midiStudioV2.css`
- `toolbox/midi-studio-v2/js/MidiStudioV2App.js`
- `toolbox/midi-studio-v2/js/bootstrap.js`
- `toolbox/midi-studio-v2/js/controls/*.js`
- `toolbox/midi-studio-v2/js/services/*.js`
- `toolbox/schemas/tools/midi-studio-v2.schema.json`
- `toolbox/schemas/game.manifest.schema.json`
- `toolbox/toolRegistry.js`
- `toolbox/renderToolsIndex.js`
- `toolbox/index.html`
- `toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Scope

Built MIDI Studio V2 as a first-class Workspace V2 tool under `toolbox/midi-studio-v2/`.

The tool preserves the Tool Template V2 header, NAV, left/center/right panels, accordions, status/logging, external CSS, external JavaScript, and HTML restrictions. It does not add MIDI input, recording, a DAW workflow, piano-roll editing, hidden fallback songs, hidden default manifests, or silent sample data.

## Validation Lanes

- contract - executed through schema parsing, manifest/toolState serializer checks, HTML restriction scan, and Workspace Manager V2 registration updates.
- runtime - partially executed through changed-file syntax checks and targeted serializer validation.
- integration - attempted through targeted MIDI Studio V2 Playwright and `npm run test:workspace-v2`; blocked by missing local Playwright Chromium browser.
- engine - skipped for code changes; existing `src/engine/audio/MediaTrackService.js` was reused and not modified.
- samples - SKIP because sample JSON alignment is out of scope.
- recovery/UAT - not directly changed beyond Workspace V2 tool registration/handoff.

## Commands

- `node --check` on changed JavaScript and Playwright files.
- JSON parse check for `toolbox/schemas/tools/midi-studio-v2.schema.json` and `toolbox/schemas/game.manifest.schema.json`.
- HTML inline restriction scan for `toolbox/midi-studio-v2/index.html`.
- Targeted serializer validation with Node ESM import.
- `git diff --check`
- `npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npm.cmd run test:workspace-v2`

## Results

- Changed-file JavaScript syntax checks: PASS.
- JSON schema parse checks: PASS.
- HTML inline script/style/event handler scan: PASS.
- Serializer valid/invalid payload check: PASS.
- `git diff --check`: PASS with line-ending warnings only for existing tracked files.
- Targeted MIDI Studio V2 Playwright: BLOCKED. Playwright could not launch because local Chromium is missing at `C:\Users\DavidQ\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- `npm run test:workspace-v2`: BLOCKED/TIMEOUT. The lane reached Playwright execution and then hit the same missing local Chromium browser across Workspace Manager V2 tests.
- Playwright V8 coverage: generated advisory report at `docs_build/dev/reports/playwright_v8_coverage_report.txt`; changed runtime JS files are reported as WARN/uncovered because Chromium could not launch.

## Playwright Coverage Added

Targeted MIDI Studio V2 tests cover:

- tool launch;
- valid multi-song manifest render;
- selecting multiple songs;
- missing MIDI source failure status;
- play/stop control state with mocked `Audio`;
- invalid payload rejection before render.

Expected pass behavior:

- Valid manifest-owned `music.songs` metadata renders without hidden fallback data, song selection updates details, missing source fails visibly, and mocked play/stop transitions button state.

Expected fail behavior:

- Invalid song payloads reject before render and leave the song list empty.

## Manual Validation

1. Open `toolbox/midi-studio-v2/index.html`.
2. Import a game manifest with root `music.songs`.
3. Confirm the Songs list shows every song.
4. Select each song and confirm source, instrument set, rendered WAV/MP3/OGG targets, details, and Game Music Director rows update.
5. Select a song with an empty `sourceMidi` and click Play.
6. Confirm the status log shows a FAIL message telling the user to add `music.songs[].sourceMidi`.
7. Select a song with a `.mid` source and use Play, Stop, and Loop.

Expected outcome:

- Valid payloads render, invalid payloads reject before render, and playback failures are visible and actionable.

## Samples Decision

SKIP. Sample JSON alignment is out of scope, and this PR does not claim sample launch compatibility.

## Src Follow-Up

Existing `src/engine/audio/MediaTrackService.js` supports media-track preview attempts and is reused for the first MIDI Studio V2 play/stop surface. A broader shared `src/` MIDI parsing/synthesis/rendered export capability does not exist yet. Future PRs should add shared `src/` MIDI capability before implementing live MIDI synthesis, MIDI parsing, or rendered WAV/MP3/OGG export pipelines.
