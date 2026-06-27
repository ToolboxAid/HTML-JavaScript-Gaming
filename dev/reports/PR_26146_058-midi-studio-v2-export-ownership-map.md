# PR_26146_058 MIDI Studio V2 Export Ownership Map

Status: PASS

## Export Tab Sections

| Section | Ownership |
| --- | --- |
| Output Type | Export owns the WAV/MP3/OGG Type dropdown and Save/Export action. |
| Render Source | Export displays selected song, playable event count, and canonical song model / octave timeline data source. |
| Output Targets | Export owns editable WAV, MP3, and OGG rendered target path metadata. |
| Future Rendering Options | Export owns future rendering placeholders; they remain red/unwired. |
| Export Status | Export reports renderer availability, WARN not implemented, and FAIL no-song/missing-target states. |

## Editable Export Values

| Value | Editable owner | Derived/read-only locations |
| --- | --- | --- |
| Export Type | Export, `#renderedExportTargetTypeSelect` | None |
| Save/Export action | Export, `#renderedExportSaveButton` | None |
| WAV target path | Export, `#renderedTargetWavInput` | Diagnostics, `#renderedTargetDiagnostics` |
| MP3 target path | Export, `#renderedTargetMp3Input` | Diagnostics, `#renderedTargetDiagnostics` |
| OGG target path | Export, `#renderedTargetOggInput` | Diagnostics, `#renderedTargetDiagnostics` |

## Unwired Rendering Plan

Rendered audio generation is not implemented in this PR.

- Save/Export remains red/unwired and reports WARN when a selected song has a target path.
- Save/Export reports FAIL when there is no selected song.
- Save/Export reports FAIL when the selected output type has no target path.
- No status text claims a file was created, written, or saved.

## Future Rendering Options

These controls are visible roadmap placeholders only and use shared unwired styling/tooltips:

- SoundFont
- Render Quality
- Sample Rate
- Normalize Volume
- Export Stems
- Loop Export

## Non-Export Tabs

- NAV has no editable export/render controls.
- Diagnostics only shows read-only rendered target diagnostics.
- Song Setup remains the owner of editable song metadata.
- Instruments remains the owner of editable instrument configuration.
- MIDI Import remains the owner of source/import/inspect controls.
- Octave Timeline remains the owner of note editing and timeline playback editing surface.
