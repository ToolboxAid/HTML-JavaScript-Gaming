# PR_26146_047 MIDI Studio V2 Note Edit Persistence And Playback Truth Validation

Status: PASS

## Scope
- Continued from PR_26146_046.
- Kept octave timeline edits as the source of truth for the canonical selected song model.
- Added visible project dirty state for edited note data.
- Added Save Project behavior that serializes the canonical tool payload, updates JSON Details, clears dirty state, and reports saved song/note counts.
- Added Reset Song Edits behavior that restores the selected song from the imported manifest baseline.
- Preserved one Studio Octave Timeline, MIDI Import tab ownership, piano-style keyboard grid, GM instrument controls, Play/Stop, section behavior, export Type + Save, and no SoundFont/export-rendering scope.

## Changed-File Syntax Checks
PASS:

```text
node --check toolbox/midi-studio-v2/js/MidiStudioV2App.js
node --check toolbox/midi-studio-v2/js/bootstrap.js
node --check toolbox/midi-studio-v2/js/controls/ActionNavControl.js
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
npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "persists octave note edits into canonical song data, playback, save, and reset|fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync|derives primary song, instrument, grid, playback, and diagnostics views from the canonical selected song|imports a local MIDI source from the MIDI Import tab without default HTTP 404 noise|renders timing ruler, section navigation, and loop region visualization" --config=codex_playwright_system_chrome.config.cjs --reporter=list --workers=1 --timeout=60000
```

Result:

```text
Running 5 tests using 1 worker
ok 1 fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync
ok 2 persists octave note edits into canonical song data, playback, save, and reset
ok 3 imports a local MIDI source from the MIDI Import tab without default HTTP 404 noise
ok 4 derives primary song, instrument, grid, playback, and diagnostics views from the canonical selected song
ok 5 renders timing ruler, section navigation, and loop region visualization
5 passed
```

## Required Assertions Covered
- PASS: editing a note updates canonical `song.studioArrangement.lanes`.
- PASS: playback uses the edited grid passed into Preview Synth.
- PASS: JSON Details reflects edited notes immediately after edit and after Save Project.
- PASS: visible dirty state appears after edit.
- PASS: switching songs and returning preserves edited notes during the current session.
- PASS: Save Project reports saved song count and editable note event count.
- PASS: Reset Song Edits restores the imported song state.
- PASS: Play and Stop still work through targeted playback tests.

## Diff Hygiene
PASS:

```text
git diff --check
```

Git reported line-ending normalization warnings for touched files, but no whitespace errors.

## Not Run
- Full samples smoke test was not run, per PR instructions.

## Result
PR_26146_047 is marked PASS. Playback did not ignore edited grid state in targeted validation.
