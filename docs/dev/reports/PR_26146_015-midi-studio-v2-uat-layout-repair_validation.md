# PR_26146_015-midi-studio-v2-uat-layout-repair Validation

## Scope

- Moved Export WAV, Export MP3, Export OGG, and export target type controls out of the Rendered Export Targets header and into the MIDI Studio V2 NAV/action bar.
- Kept export actions honest through the existing rendered export action controller: missing song/target reports FAIL, unimplemented rendering reports WARN, and no fake success is claimed.
- Repaired accordion toggle wiring so header buttons toggle themselves while nested header controls remain independently clickable.
- Updated accordion +/- text state to match expanded/collapsed state.
- Added expanded workspace behavior for Hide Headers/Details with status logging, primary work surface expansion, header/detail hiding, and NAV/status/recovery access preserved.
- Preserved guided Song Sheet fields, Use Example Test Song, dropdowns, grid editor, snapping, generated lanes, playhead/loop, MIDI inspection, and rendered preview behavior.

## Validation

- PASS: `node --check` for changed JavaScript and targeted Playwright spec.
- PASS: MIDI Studio V2 inline HTML check for inline scripts, styles, and event handlers returned no matches.
- PASS: targeted MIDI Studio V2 Playwright suite: `32 passed`.
- PASS: `git diff --check` completed successfully. Git reported line-ending warnings for existing LF/CRLF normalization only.
- SKIP: Workspace Manager V2 registration/handoff was not run because this PR did not touch Workspace Manager registration or handoff files.
- SKIP: full samples smoke test per request. Samples decision: SKIP because sample JSON alignment is out of scope.

## Notes

- The first full Playwright run timed out while exposing an accordion self-click guard bug. The isolated accordion test was rerun after the fix and passed, then the full targeted suite passed.
