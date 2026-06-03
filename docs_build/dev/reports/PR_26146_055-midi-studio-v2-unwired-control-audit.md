# PR_26146_055 MIDI Studio V2 Unwired Control Audit

## Scope

Scope reviewed: MIDI Studio V2 visible UI surfaces after PR054 tab bucket consolidation.

Central marker: `setUnwiredControlState` in `tools/midi-studio-v2/js/controls/UnwiredControlState.js`.

Central style: `.midi-studio-v2__unwired-control` in `tools/midi-studio-v2/styles/midiStudioV2.css`.

## Marked Incomplete / Unwired Controls

| Surface | Controls | Status | Behavior |
| --- | --- | --- | --- |
| Tool nav rendered output | `renderedExportTargetTypeSelect`, `renderedExportSaveButton`, Output Type label | Not implemented | Red styling plus tooltip. Save Output still logs `Export rendering not implemented...` and does not claim project save. |
| Tool nav playback for source-only songs | `playButton` when selected song has no editable arrangement and no rendered OGG/MP3/WAV target | Incomplete | Red styling plus tooltip before click. Clicking logs live MIDI not implemented and actionable failure. |
| Workspace proxy nav outside Workspace Manager handoff | `workspaceImportManifestButton`, `workspaceCopyManifestButton`, `workspaceExportManifestButton` | Incomplete | Red styling plus tooltip when visible. In Workspace Manager launches these proxy buttons remain hidden and Return to Workspace remains normal. |

## Reviewed As Wired / Not Marked

| Surface | Controls | Reason |
| --- | --- | --- |
| Tool nav | Import JSON Manifest, Save Project, Reset Song Edits, Export JSON, Stop All Audio | Wired to manifest import, tool-state serialization, save/reset state, JSON Details preview, and audio stop behavior. Disabled states are readiness gates, not unwired placeholders. |
| MIDI Import | MIDI file picker, Import MIDI Source, Inspect MIDI Source | Wired to source file selection and MIDI inspection. Inspect disabled without a selected song is state-dependent. |
| Song Setup | Add Song, Song Details fields, Key/Style dropdowns, Song Sheet parse | Wired to canonical song model and existing parse/update paths. |
| Instruments | GM Type, GM Instrument/Patch, visibility, mute, solo, volume, pan, add/delete | Wired to preview lane state, visible timeline rendering, and playback settings. Unsupported preview mappings remain audible approximations with WARN status rather than unwired controls. |
| Octave Timeline | Canvas editor, zoom controls, section controls, timing preview controls | Wired to canonical timeline edits, zoom, playhead, and Preview Synth timing preview. Section presets disabled for missing section labels are unavailable state, not incomplete implementation. |
| Diagnostics | JSON Details, Timeline Diagnostics, Audio Diagnostics, Rendered Preview diagnostics, Rendered Export Targets, Status | Read-only diagnostics or explicit diagnostic actions such as Copy JSON and Clear. |

## Result

No known visible MIDI Studio V2 incomplete control remains visually indistinguishable from a functional control in the audited surfaces.
