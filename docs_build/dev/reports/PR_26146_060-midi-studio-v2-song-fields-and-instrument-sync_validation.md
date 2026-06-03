# PR_26146_060 MIDI Studio V2 Song Fields And Instrument Sync Validation

Status: PASS

## Scope Validated

- Removed Tags and Usage from the editable Song Setup details UI.
- Made Song Id read-only by default and derived from Name as camelCase on Name edits.
- Kept Song Sheet fields editable and tightened the Song Sheet grid so fields use available horizontal space.
- Restored Octave Timeline quick Instruments controls for select, Mute, Solo, and Hide/Show without moving GM Type or Instrument dropdowns back into the timeline.
- Kept GM Type and Instrument/Patch dropdowns owned by the Instruments tab.
- Synced timeline quick selection and Instruments tab selection through the same `selectedInstrumentId` state.
- Replaced Play Middle C with a horizontal audition keyboard that follows the selected instrument octave range.
- Preserved canvas-backed timeline editing, Export wording, Editing History placeholders, Play/Stop, manifest import, multiple songs, GM controls, launch NAV, and unwired-control behavior.

## Validation Commands

```powershell
node --check tools/midi-studio-v2/js/controls/SongDetailsControl.js
node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js
node --check tools/midi-studio-v2/js/MidiStudioV2App.js
node --check tools/midi-studio-v2/js/bootstrap.js
node --check tests/playwright/tools/MidiStudioV2.spec.mjs
rg --pcre2 -n "<style\b|<script\b(?![^>]*\bsrc=)|\son[a-z]+\s=|style\s=" tools/midi-studio-v2/index.html; if ($LASTEXITCODE -eq 1) { exit 0 } else { exit $LASTEXITCODE }
npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright -g "syncs PR060 song fields instrument selection and audition keyboard"
npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright -g "canvas note editing flow supports hover click drag paint erase and playback|keeps JSON wording and Song Setup editing history placeholders honest|enforces SSoT export ownership and future control honesty|syncs PR060 song fields instrument selection and audition keyboard"
git diff --check
```

## Results

- JS syntax checks: PASS.
- Inline script/style/event handler guard: PASS, no matches.
- Targeted PR060 Playwright test: PASS, 1 passed.
- Targeted MIDI Studio V2 regression Playwright set: PASS, 4 passed.
- `git diff --check`: PASS. Git reported line-ending normalization warnings only.
- Full samples smoke test: not run, per PR instruction.

## Playwright Proof Points

- Tags and Usage fields are absent from Song Setup.
- Name edits update Id to `camptownRacesUatReel` and `newSong4`.
- Song Sheet intro/loop fields are editable and rendered in a multi-column grid.
- Octave Timeline shows quick instrument select/mute/solo/visibility controls.
- Timeline quick controls contain no GM Type or Instrument dropdowns.
- Instruments tab owns GM Type and Instrument/Patch dropdowns.
- Selecting Bass in Octave Timeline selects Bass in Instruments.
- Selecting Lead in Instruments selects Lead in Octave Timeline.
- `InstrumentGridControl.selectedInstrumentId` is the canonical selected-instrument state; `selectedLane` is an accessor, not a second own state slot.
- Instruments tab renders the audition keyboard with Bass octave range 1-3 and 36 keys.
- Clicking C2 on the audition keyboard produces a Preview Synth oscillator event and status log.
- Play and Stop still work after the PR060 changes.
