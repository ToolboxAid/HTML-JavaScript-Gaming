# PR_26146_125-132 Song Model Audit

## PASS
- Name, Classification, generated ID, Tempo, Key, Style, Song Sheet sections, Song Sequence, Instruments, generated/manual notes, and export metadata remain on the canonical selected song model.
- Generated ID remains `camelCase(Name) + "-" + Classification`.
- The PR125-132 Playwright audit verified the active song after classification update as `camptownRacesUatReel-Loop`.
- `Object.hasOwn(app, "selectedSongId")` remains false; active song state is derived through the canonical payload and selected song state.
- Parse/Generate updates the canonical arrangement, Octave Timeline, diagnostics, JSON Details, and status.

## Notes
- The selected song ID follows the generated ID after classification changes.
- Song Sheet sequence order is the build/playback order used by timeline section labels.
- Manual note edits made through the canvas are reflected in canonical lane text and playable timeline data.

## WARN
- Workspace Manager V2 validation wrapper timed out, so cross-tool save ownership could not be revalidated through the required `npm run test:workspace-v2` command in this run. The PR125-132 targeted Workspace launch split test passed.
