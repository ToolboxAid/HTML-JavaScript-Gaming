# PR_26146_045 MIDI Studio V2 Canonical Song Model Cleanup Validation

Status: PASS

## Scope
- Continued from PR_26146_044.
- Audited MIDI Studio V2 primary workflow data/UI surfaces for duplicate song, instrument, section, and timeline state.
- Removed the duplicate primary Song Sheet Summary panel.
- Consolidated selected song state so `selectedSongId` derives from `payload.activeSongId`.
- Kept instrument grid, song details, playback, diagnostics, manifest serialization, and save/export flows derived from the canonical selected song model.
- Preserved piano-style octave grid, manifest import, multiple songs, GM controls, playback, Play/Stop, section/loop behavior, export Type + Save behavior, and roadmap status rules.

## Changed-File Syntax Checks
PASS:

```text
node --check toolbox/midi-studio-v2/js/MidiStudioV2App.js
node --check toolbox/midi-studio-v2/js/bootstrap.js
node --check toolbox/midi-studio-v2/js/controls/SongSheetControl.js
node --check tests/playwright/tools/MidiStudioV2.spec.mjs
```

Additional guards:

```text
HTML external-only guard passed
CSS brace check passed
```

## Targeted Playwright Validation
PASS:

```text
npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "derives primary song, instrument, grid, playback, and diagnostics views from the canonical selected song|keeps selected song details editable and nests Song Sheet under the details panel|octave timeline freezes compact headers and note labels while active cells stay textless|fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync|renders timing ruler, section navigation, and loop region visualization" --config=codex_playwright_system_chrome.config.cjs --reporter=list --workers=1 --timeout=60000
```

Result:

```text
Running 5 tests using 1 worker
ok 1 fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync
ok 2 octave timeline freezes compact headers and note labels while active cells stay textless
ok 3 keeps selected song details editable and nests Song Sheet under the details panel
ok 4 derives primary song, instrument, grid, playback, and diagnostics views from the canonical selected song
ok 5 renders timing ruler, section navigation, and loop region visualization
5 passed
```

## Required Assertions Covered
- PASS: only one canonical selected song state is used (`selectedSongId` is derived from `payload.activeSongId`, not stored as an own app property).
- PASS: song details update from the canonical selected song model.
- PASS: instrument rows update from the canonical selected song model.
- PASS: octave grid renders from the canonical selected song model.
- PASS: playback reads playable events from the canonical selected song model.
- PASS: diagnostics are read-only and derived.
- PASS: duplicate Song Sheet Summary/stale duplicate primary panel is removed.
- PASS: switching songs does not leave stale duplicated data visible.
- PASS: Play and Stop still work through preserved targeted playback/editing tests.

## Diff Hygiene
PASS:

```text
git diff --check
```

Git reported line-ending normalization warnings for touched files, but no whitespace errors.

## Not Run
- Full samples smoke test was not run, per PR instructions.

## Result
PR_26146_045 is marked PASS. No duplicate song/instrument/timeline state remains in the primary workflow based on changed-file implementation and targeted Playwright validation.
