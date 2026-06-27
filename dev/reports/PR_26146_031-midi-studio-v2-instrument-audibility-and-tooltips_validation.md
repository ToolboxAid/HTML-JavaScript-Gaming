# PR_26146_031-midi-studio-v2-instrument-audibility-and-tooltips Validation

Status: PASS

## Scope

- Continued from `PR_26146_030-midi-studio-v2-instrument-row-polish`.
- Expanded MIDI Studio V2 GM family instrument lists so every type exposes at least 3 options.
- Added audible Preview Synth fallback mappings and visible WARN diagnostics for unsupported GM options.
- Added short instrument audition playback on instrument/type changes after audio context access.
- Added accessible `title`/`aria-label` coverage for icon-only mute, solo, show/hide, delete, and add controls.
- Preserved compact instrument rows, widened left column, gray dimmed notes, selected-note layering, chord editing, playback, playhead timing, and no-scroll-jump behavior.

## Validation Commands

```powershell
node --check src/engine/audio/PreviewInstrumentPacks.js
node --check src/engine/audio/PreviewSynthEngine.js
node --check toolbox/midi-studio-v2/js/MidiStudioV2App.js
node --check toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js
node --check tests/playwright/tools/MidiStudioV2.spec.mjs
npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "octave timeline editor is the default editable and playable Studio workflow|octave grid density supports icon controls and simultaneous chord editing" --reporter=list --workers=1 --timeout=60000
git diff --check
```

## Results

- PASS: changed-file syntax checks passed.
- PASS: targeted MIDI Studio V2 Playwright coverage passed, `2 passed`.
- PASS: `git diff --check` exited successfully. Git reported only its line-ending notice for the touched Playwright spec.
- PASS: Playwright V8 coverage artifacts were refreshed:
  - `docs_build/dev/reports/playwright_v8_coverage_report.txt`
  - `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- PASS: coverage guardrail reports no changed runtime JS warnings.

## Playwright Proof

The targeted MIDI Studio V2 Playwright run validates:

- octave timeline editor remains visible, editable, and playable by default.
- Songs populate the left Songs column and imported manifest data populates the timeline.
- instrument controls populate the left Instruments column.
- each GM Type/family exposes at least 3 instrument options.
- quiet/unsupported GM instruments map to audible preview presets and log visible WARN diagnostics.
- percussion instruments use percussion preview behavior.
- Mute and Solo have tooltip/accessibility labels while remaining icon-only visually.
- Show/Hide, Delete, and Add controls have tooltip/accessibility labels.
- icon-only controls remain compact on one horizontal row without wrapping.
- selecting an instrument highlights its notes while other visible instrument notes remain dimmed.
- show/hide behavior still hides and restores instrument notes.
- multiple notes can exist in the same bar/beat column, and adding one note does not remove sibling notes.
- chords and simultaneous drum events remain editable and playable.
- Play and Stop still work from visible timeline data.
- playhead progression remains aligned to bar/beat timing.
- instrument button clicks do not change the Instruments panel scroll position.

## Lanes

- engine/audio runtime: executed through changed-file syntax checks and MIDI Studio V2 browser playback coverage because `src/engine/audio` preview synthesis behavior changed.
- tool runtime: executed through targeted MIDI Studio V2 Playwright coverage because instrument controls, diagnostics, and playback interactions changed.
- integration: skipped; this PR does not change Workspace handoff contracts.
- samples: skipped by explicit PR instruction. Full samples smoke test was not run.
- recovery/UAT: covered only for the targeted MIDI Studio V2 runtime slice named by this PR.

## Manual Validation Notes

1. Open `toolbox/midi-studio-v2/index.html`.
2. On the Studio tab, verify Instruments rows show compact icon-only Mute, Solo, Show/Hide, and Delete controls plus accessible browser tooltips.
3. Open each GM Type dropdown family and verify at least 3 instrument options are available.
4. Select `Synth Effects` -> `FX 4 (Atmosphere)` and verify the status log shows a WARN mapping message and the preview tone is audible after audio is enabled.
5. Select `Percussive` -> `Room Drum Kit` and verify the status log shows a WARN mapping message and the preview is percussive.
6. Click instrument buttons while the Instruments area is scrolled and verify scroll position does not jump.
7. Add simultaneous notes in one bar/beat column, press Play, then Stop, and verify chords/drums play and stop correctly.

## Out Of Scope

- SoundFont playback.
- export rendering.
- MIDI recording/input.
- full samples smoke test.
