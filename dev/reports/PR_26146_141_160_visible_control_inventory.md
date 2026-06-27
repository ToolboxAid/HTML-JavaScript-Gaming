# PR_26146_141-160 Visible Control Inventory

## Audit Method

Playwright scans visible controls across these MIDI Studio V2 tabs:

- Song Setup
- Octave Timeline
- Instruments
- Auto-Create Parts
- MIDI Import
- Diagnostics
- Export

The scan covers buttons, inputs, selects, textareas, outputs, accordions, role buttons, tabs, contenteditable controls, and the canvas timeline.

## Status Classes

- WORKING: wired and verified by UAT flow or ownership scan.
- BROKEN: found during sprint and fixed.
- UNWIRED: intentionally incomplete, red, disabled or marked, with tooltip/status.
- DUPLICATE: duplicate editable ownership.

## Inventory Summary

PASS: More than 100 visible MIDI Studio controls are classified by Playwright.

PASS: No visible controls are left unclassified in the PR141-160 targeted test.

PASS: No wired controls render with the red/unwired class.

PASS: Every red/unwired control has the unwired visual class and a title/help status.

PASS: Every MIDI accordion in the visible tab set opens and closes with matching `X` and `+` header state.

## BROKEN Findings

BROKEN fixed: JSON Details could stay on the local MIDI import song after returning to another selected song. The fix refreshes JSON Details after `selectSong()` applies the active canonical song arrangement.

## UNWIRED Findings

The following workflows remain intentionally red/unwired:

- Song Sequence drag/drop editing
- Game trigger runtime sync
- editing history: Undo, Redo, Snapshots, Revision History, Revert To Saved, Autosave
- browser MIDI input, MIDI device selection, MIDI recording
- advanced MIDI-to-canonical conversion
- SoundFont/render quality/sample rate controls
- Normalize Volume, Export Stems, Loop Export
- rendered Save WAV/MP3/OGG audio creation

## DUPLICATE Findings

PASS: No duplicate editable owner was found for canonical values across visible tabs.

