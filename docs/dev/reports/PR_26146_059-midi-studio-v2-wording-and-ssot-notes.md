# PR_26146_059 MIDI Studio V2 Wording And SSoT Notes

Status: PASS

## Wording

| Workflow | Wording | Reason |
| --- | --- | --- |
| JSON manifest/tool-state import | Import JSON Manifest | JSON is editable and round-trippable. |
| JSON tool-state preview | Export JSON | JSON is editable and round-trippable. |
| Rendered audio WAV | Save WAV | Rendered audio generation is a future file-save workflow, not a JSON export. |
| Rendered audio MP3 | Save MP3 | Rendered audio generation is a future file-save workflow, not a JSON export. |
| Rendered audio OGG | Save OGG | Rendered audio generation is a future file-save workflow, not a JSON export. |

The Export tab keeps the Type dropdown. The rendered audio action label updates from that selection.

## Ownership

| Value/control | Owner |
| --- | --- |
| Song metadata | Song Setup |
| Editing History placeholders | Song Setup |
| Rendered output Type dropdown | Export |
| Rendered audio save action | Export |
| Rendered target paths | Export |
| JSON Details / derived data | Diagnostics |

## Editing History Placeholders

These controls are future placeholders only and are disabled, red/unwired, and inert:

- Undo
- Redo
- Snapshots
- Revision History
- Revert To Saved
- Autosave

They do not mutate canonical song data and are not duplicated in other tabs.

## Preserved Behavior

- Canvas-backed Octave Timeline remains editable.
- Play and Stop remain functional.
- Manifest import and multiple songs remain supported.
- GM instrument controls remain under Instruments.
- Launch-specific NAV behavior remains unchanged.
- Shared red unwired control behavior remains centralized through `FutureControlsControl` and `setUnwiredControlState`.
