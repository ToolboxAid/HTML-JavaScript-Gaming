# PR_26146_161_200 Visible Control Inventory

Audit Method:
- Added `expectMidiStudioReleaseCandidateControlAudit`.
- Walked visible controls across Song Setup, Octave Timeline, Instruments, Auto-Create Parts, MIDI Import, Diagnostics, and Export.
- Classified visible controls as WORKING, READ-ONLY DERIVED, or RED/UNWIRED FUTURE.

WORKING:
- Import JSON and Export JSON tool-state workflows.
- Song Details fields: Name, Classification, Tempo, Key, Style, Notes.
- Generated ID refresh from `camelCase(Name) + "-" + Classification`.
- Classification help and example workflow.
- Game Usage checkboxes and custom usage field as metadata assignments.
- Song Sheet section editors for Intro, Verse, Chorus, Bridge, Outro, and custom sections.
- Available Sections list for populated sections.
- Song Sequence Add, Duplicate, Move Up, Move Down, Remove.
- Parse Guided Song Sheet and Regenerate Arrangement.
- Canvas Octave Timeline hover, click toggle, drag paint, drag erase, selected cell, section labels, frozen Bar/Beat, and piano-key audition.
- Timeline quick instrument select/mute/solo/hide.
- Instruments tab settings, audition keyboard, preset workflow, duplicate/move/delete safety.
- Diagnostics Copy JSON and Clear Status.

READ-ONLY DERIVED:
- Generated ID field and preview.
- Available Section metrics, sequence summary, generation summary.
- Section colors and timeline labels.
- JSON Details, Timeline Diagnostics, Audio Diagnostics.
- Export Readiness and Manifest Readiness summaries.
- Classification guide and library summary.

RED/UNWIRED FUTURE:
- Song Sequence drag/drop.
- History controls: Undo, Redo, Snapshots, Revision History, Revert To Saved, Autosave.
- Game Usage runtime sync.
- Future MIDI device input, record MIDI, and advanced canonical conversion controls.
- Advanced instrument effects and future controls.
- Rendered audio Save WAV/MP3/OGG path, SoundFont, render quality, sample rate, normalize volume, stems, loop export.
- Workspace manifest proxy controls when launched in workspace mode.

DUPLICATE:
- None found by the PR161 release-candidate audit.
- Intentional multi-control groups remain scoped to one owner: Game Usage checkboxes, lane mute/solo toggles, and per-lane instrument settings.
