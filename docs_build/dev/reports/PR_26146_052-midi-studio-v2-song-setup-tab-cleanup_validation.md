# PR_26146_052 MIDI Studio V2 Song Setup Tab Cleanup Validation

## Summary

Status: PASS

Playwright impacted: Yes

This PR reorders the MIDI Studio V2 tabs so Song Setup is first/default, renames the visible Studio tab to Octave Timeline, adds canonical Add Song support, removes the visible top selected-song details form from Song Setup, and uses the existing Key/Style dropdowns as canonical song arrangement editors.

## Files Changed

- `tools/midi-studio-v2/index.html`
- `tools/midi-studio-v2/js/MidiStudioV2App.js`
- `tools/midi-studio-v2/js/bootstrap.js`
- `tools/midi-studio-v2/js/controls/SongDetailsControl.js`
- `tools/midi-studio-v2/js/controls/SongSetupControl.js`
- `tools/midi-studio-v2/js/controls/SongSheetControl.js`
- `tools/midi-studio-v2/styles/midiStudioV2.css`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26146_052-midi-studio-v2-song-setup-tab-cleanup_validation.md`

## Validation Commands

- PASS: changed-file JavaScript syntax checks with `node --check`.
- PASS: HTML external-only check for `<script>` usage.
- PASS: HTML no-inline-style/no-inline-handler check for `<style| on[a-z]+=`.
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "cleans up Song Setup tab|canvas octave timeline edits canonical data"`.
- PASS: `git diff --check` with line-ending warnings only.

## Playwright Coverage

The targeted MIDI Studio V2 tests prove:

- Song Setup appears before Octave Timeline.
- The visible Studio tab text is gone.
- Octave Timeline tab exists.
- Add Song creates `new-song-4` in the canonical payload model.
- The top Key/Style detail fields are removed from the visible Song Setup surface.
- Key and Style dropdowns update the selected song canonical arrangement.
- Fields below/around Song Sheet were removed from Song Setup, including Director and Rendered Export Targets panels.
- Song Sheet bottom spacing is reduced.
- Play and Stop still work from the canvas-backed Octave Timeline.
- The PR051 canvas timeline still edits canonical data and updates playback without DOM grid repaint classes.

## Coverage Artifacts

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` was refreshed by the targeted Playwright run.
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt` was refreshed by the targeted Playwright run.
- Coverage is advisory only; the guardrail reports low function coverage for `MidiStudioV2App.js` as WARN, not FAIL.

## Samples Decision

Full samples smoke test: SKIP.

Reason: explicitly out of scope for this PR and not requested; this change is limited to MIDI Studio V2 UI/runtime behavior.

## Notes

An initial focused Playwright run exposed that the hidden `#songDetails` element still computed visible because local CSS forced `display: grid`. The hidden-state CSS rule was corrected and the focused Playwright suite passed on rerun.
