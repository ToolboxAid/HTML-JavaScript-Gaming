# PR_26146_057 MIDI Studio V2 SSoT Export And Future Controls Validation

Status: PASS

## Scope

- Restored `Export` as its own MIDI Studio V2 tab.
- Moved rendered output Type and Save/Export controls out of NAV and into Export.
- Kept rendered export controls honest with shared red unwired styling because rendered audio export is still not implemented.
- Added red unwired future placeholders for Instruments, Export, and MIDI Input roadmap controls.
- Added a wired Play C audition button for the selected instrument in the Instruments tab.
- Preserved canvas-backed Octave Timeline editing and playback from PR056.

## Validation Commands

```powershell
node --check tools/midi-studio-v2/js/controls/FutureControlsControl.js; node --check tools/midi-studio-v2/js/bootstrap.js; node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js; node --check tools/midi-studio-v2/js/MidiStudioV2App.js; node --check tools/midi-studio-v2/js/controls/RenderedExportActionsControl.js; node --check tests/playwright/tools/MidiStudioV2.spec.mjs
rg -n -P '<script(?![^>]*\bsrc=)' tools/midi-studio-v2/index.html; if ($LASTEXITCODE -eq 1) { exit 0 } else { exit $LASTEXITCODE }
rg -n '<style| on[a-z]+=' tools/midi-studio-v2/index.html; if ($LASTEXITCODE -eq 1) { exit 0 } else { exit $LASTEXITCODE }
npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "enforces SSoT export ownership|canvas note editing flow supports hover click drag paint erase and playback|canvas octave timeline edits canonical data"
git diff --check
```

## Results

- Changed-file JavaScript syntax checks: PASS.
- MIDI Studio V2 HTML inline script/style/event-handler guard: PASS.
- Targeted Playwright: PASS, 3 tests passed.
- `git diff --check`: PASS. Git reported line-ending normalization warnings only.
- Full samples smoke test: not run per PR instruction.

## Targeted Playwright Coverage

The targeted test slice proves:

- Export tab exists with Export Type and Save/Export only in the Export tab.
- Export controls no longer exist in the NAV/tool menu.
- Song metadata controls have one owning Song Setup location.
- Instrument configuration controls have one owning Instruments location.
- Diagnostics keeps derived/debug controls read-only.
- Future controls render as disabled red unwired controls with tooltip/status text.
- MIDI Input future controls are red/unwired and inactive.
- Play C audition is present and wired to Preview Synth.
- Canvas Octave Timeline note editing still updates canonical song data.
- Play and Stop still work from edited visible timeline data.

## Coverage Artifacts

- `docs/dev/reports/playwright_v8_coverage_report.txt`
- `docs/dev/reports/coverage_changed_js_guardrail.txt`

Coverage is advisory only. The guardrail reports a low function-coverage warning for `tools/midi-studio-v2/js/MidiStudioV2App.js`; all changed runtime JS loaded in the targeted browser run.
