# PR_26146_058 MIDI Studio V2 Export Tab Usability And Render Plan Validation

Status: PASS

## Scope

- Kept Export as the only owner of export/render/output controls.
- Added clear Export tab sections:
  - Output Type
  - Render Source
  - Output Targets
  - Future Rendering Options
  - Export Status
- Added Export-owned editable rendered target path fields for WAV, MP3, and OGG.
- Added Diagnostics read-only rendered target diagnostics.
- Preserved honest red/unwired styling for future rendering controls and rendered Save/Export.
- Preserved canvas Octave Timeline editing and Play/Stop behavior.

## Validation Commands

```powershell
node --check tools/midi-studio-v2/js/controls/ExportPanelControl.js; node --check tools/midi-studio-v2/js/bootstrap.js; node --check tools/midi-studio-v2/js/MidiStudioV2App.js; node --check tests/playwright/tools/MidiStudioV2.spec.mjs
rg -n -P '<script(?![^>]*\bsrc=)' tools/midi-studio-v2/index.html; if ($LASTEXITCODE -eq 1) { exit 0 } else { exit $LASTEXITCODE }
rg -n '<style| on[a-z]+=' tools/midi-studio-v2/index.html; if ($LASTEXITCODE -eq 1) { exit 0 } else { exit $LASTEXITCODE }
npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "keeps Export tab usable|enforces SSoT export ownership|canvas note editing flow supports hover click drag paint erase and playback|canvas octave timeline edits canonical data"
git diff --check
```

## Results

- Changed-file JavaScript syntax checks: PASS.
- MIDI Studio V2 HTML inline script/style/event-handler guard: PASS.
- Targeted Playwright: PASS, 4 tests passed.
- `git diff --check`: PASS. Git reported line-ending normalization warnings only.
- Full samples smoke test: not run per PR instruction.

## Tested Behavior

- Export tab owns Type dropdown and Save/Export.
- WAV/MP3/OGG target paths are editable only in Export.
- Editing target paths updates the canonical selected song model.
- Diagnostics rendered target values are read-only/derived.
- Future Rendering Options render red/unwired with tooltip/status.
- Save/Export reports WARN not implemented when no renderer exists.
- Save/Export reports FAIL when no song is selected.
- Export controls are not duplicated in NAV.
- Play and Stop still work.

## Coverage Artifacts

- `docs/dev/reports/playwright_v8_coverage_report.txt`
- `docs/dev/reports/coverage_changed_js_guardrail.txt`

Coverage is advisory only. The changed runtime JS guardrail reports no warnings.
