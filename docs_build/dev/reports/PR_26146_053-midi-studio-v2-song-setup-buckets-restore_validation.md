# PR_26146_053 MIDI Studio V2 Song Setup Buckets Restore Validation

## Summary

Status: PASS

Playwright impacted: Yes

This PR restores Song Setup as the editable song metadata surface while preserving the PR052 tab order and the PR051 canvas-backed Octave Timeline. Song Setup now has the common buckets: Songs, Song Details, Song Sheet, Sections / Loop, and Status.

## Tabs Inventory Note

The requested uploaded `Tabs.txt` inventory was not present in the repository, Downloads, or temp upload locations during execution. The current `tools/midi-studio-v2/index.html` DOM inventory was used as the concrete fallback, and the resulting tab/bucket map is documented in `docs_build/dev/reports/PR_26146_053-midi-studio-v2-tab-bucket-map.md`.

## Files Changed

- `tools/midi-studio-v2/index.html`
- `tools/midi-studio-v2/js/MidiStudioV2App.js`
- `tools/midi-studio-v2/js/bootstrap.js`
- `tools/midi-studio-v2/js/controls/SongDetailsControl.js`
- `tools/midi-studio-v2/js/controls/SongSheetControl.js`
- `tools/midi-studio-v2/styles/midiStudioV2.css`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`
- `docs_build/dev/reports/PR_26146_053-midi-studio-v2-song-setup-buckets-restore_validation.md`
- `docs_build/dev/reports/PR_26146_053-midi-studio-v2-tab-bucket-map.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Validation Commands

- PASS: changed-file JavaScript syntax checks with `node --check`.
- PASS: HTML external-only check for `<script>` usage.
- PASS: HTML no-inline-style/no-inline-handler check for `<style| on[a-z]+=`.
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "restores Song Setup editable buckets|canvas octave timeline edits canonical data"`.
- PASS: `git diff --check` with line-ending warnings only.

## Playwright Coverage

The targeted MIDI Studio V2 tests prove:

- Song Setup contains Songs, Song Details, Song Sheet, Sections / Loop, and Status buckets.
- Song Details contains editable Name, Id, Tempo/BPM, Key, Style, Tags, Usage, and Notes when present.
- Editing Song Details updates the canonical selected song model.
- Switching songs refreshes Song Details and clears stale values.
- Song Sheet remains visible immediately after Song Details.
- No separate duplicate Song Sheet Summary bucket exists; Song Sheet status/summary lives inside the Song Sheet bucket.
- MIDI Import controls are hidden from Song Setup and remain owned by the MIDI Import tab.
- Diagnostics-only buckets are hidden from Song Setup.
- Octave Timeline still renders the canvas-backed editor and edits canonical notes.
- Play and Stop still work.

## Coverage Artifacts

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` was refreshed by the targeted Playwright run.
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt` was refreshed by the targeted Playwright run.
- Changed runtime JS coverage guardrail reports no warnings.

## Samples Decision

Full samples smoke test: SKIP.

Reason: explicitly out of scope for this PR and not requested; this change is limited to MIDI Studio V2 UI/runtime behavior.

## Manual Validation Notes

1. Open MIDI Studio V2 and import the UAT manifest.
2. Confirm Song Setup is first and Octave Timeline is second.
3. Confirm Song Setup shows Songs, Song Details, Song Sheet, Sections / Loop, and Status.
4. Edit Name, Id, Tempo/BPM, Key, Style, Tags, Usage, and Notes, then verify the JSON Details output after switching to Diagnostics.
5. Switch songs and confirm Song Details refresh to the newly selected song.
6. Open Octave Timeline, click a note cell, then Play and Stop.
