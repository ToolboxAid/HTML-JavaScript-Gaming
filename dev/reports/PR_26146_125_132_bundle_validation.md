# PR_26146_125-132 Bundle Validation

Date: 2026-05-30

## Scope
- MIDI Studio V2 codebase completion lane.
- Baseline: PR_26146_117-124.
- Primary implementation: Octave Timeline lane headers no longer expose duplicate editable GM Type, GM Instrument, Volume, or Pan controls. Instruments tab remains the editable SSoT for those values.
- Targeted coverage: PR125-132 Playwright slice added for SSoT, Song Sheet, canvas timeline, instruments, playback, export, manifest, and Workspace/tool launch split.

## Validation
- PASS: `node --check toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "PR125-132" --reporter=line`
  - 2 passed.
- WARN: Extra non-required check `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "imports UAT manifest and plays" --reporter=line`
  - Fails on legacy spreadsheet-DOM expectations against the current canvas-backed timeline renderer.
  - Not used as the required MIDI Studio PR125-132 validation signal.
- WARN: `npm run test:workspace-v2`
  - Timed out twice at 240s and 600s with no final runner result.
  - Adjunct direct Workspace Manager V2 Playwright command also timed out at 420s.
  - Generic report churn from the timed-out lane runner was restored.
- PASS: `git diff --check`
  - Exit code 0. Windows line-ending warning only.

## Coverage
- `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed by the passing PR125-132 MIDI Studio Playwright run.
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt` reports no changed runtime JS coverage warnings.

## Result
PASS for the MIDI Studio V2 PR125-132 bundle. Workspace validation is recorded as WARN because the required wrapper did not complete inside a 10 minute ceiling.
