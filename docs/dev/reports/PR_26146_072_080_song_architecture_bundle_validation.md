# PR_26146_072_080 Song Architecture Bundle Validation

Status: PASS for targeted MIDI Studio V2 runtime. WARN for required Workspace V2 lane because existing Workspace Manager V2 failures remain outside this PR scope.

## Scope Verified
- Song Details owns editable Name and Classification only, with generated read-only ID from `camelCase(Name) + "-" + Classification` when Classification is populated.
- Tags and Usage remain absent from Song Details editable ownership.
- Song Sheet uses named Intro, Verse, Chorus, Bridge, Outro progression fields plus a wired Add Custom Section action.
- Available Sections lists populated sections only and visibly includes section bar/chord counts plus section color data.
- Song Sequence add, duplicate, move up, move down, and remove actions update canonical sequence order.
- Parse Guided Song Sheet updates the canonical song model, Octave Timeline order/colors, diagnostics, and JSON Details.
- Warnings render only in the right-column Warnings accordion.
- Export ownership, Save WAV/MP3/OGG wording, instrument SSoT, audition keyboard, Play/Stop, selectedInstrumentId sync, and launch NAV behavior were preserved.

## Validation Commands
- PASS: `node --check tools/midi-studio-v2/js/controls/SongSheetControl.js`
- PASS: `node --check tools/midi-studio-v2/js/MidiStudioV2App.js`
- PASS: `node --check tools/midi-studio-v2/js/bootstrap.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `node --check tools/midi-studio-v2/js/controls/SongDetailsControl.js`
- PASS: `node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `node --check tools/midi-studio-v2/js/controls/OctaveTimelineCanvasRenderer.js`
- PASS: `node --check tools/midi-studio-v2/js/controls/ExportPanelControl.js`
- PASS: `node --check src/engine/audio/SongSheetParser.js`
- PASS: `rg --pcre2 -n '<style\b|<script\b(?![^>]*\bsrc=)|\son[a-z]+\s=|style\s=' tools/midi-studio-v2/index.html` returned no inline script, style, event-handler, or inline-style matches.
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "PR072-080" --reporter=list` ran 1 test and passed.
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "PR070|PR071|PR072-075|PR076-079|PR072-080" --reporter=list` ran 5 tests and passed.
- FAIL unrelated: `npm run test:workspace-v2` ran 72 Workspace Manager V2 tests: 49 passed, 23 failed.
- PASS: `git diff --check`

## Workspace V2 Lane Classification
The required workspace-contract lane failed outside MIDI Studio V2. Representative failures:
- Workspace Manager V2 helper still expects 11 tool tiles and now receives 12.
- Several repo/game-selection and workspace save/restore tests share the same 11 vs 12 tile-count assertion.
- One Asset Manager V2 session-context test timed out after 120000 ms and then reported closed-page coverage cleanup.

No failing workspace-contract stack referenced the changed MIDI Studio V2 files.

## Playwright Coverage
`docs/dev/reports/playwright_v8_coverage_report.txt` and `docs/dev/reports/coverage_changed_js_guardrail.txt` were regenerated from the targeted MIDI Studio Playwright run. Changed runtime JS files were collected with advisory coverage.

## Samples Decision
SKIP: full samples smoke was not run because this PR only changes MIDI Studio V2 tool behavior and tests use the targeted UAT manifest fixture.
