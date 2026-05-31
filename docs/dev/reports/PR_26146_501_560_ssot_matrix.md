# PR_26146_501_560 SSoT Matrix

| Canonical Value / Workflow | Editable Owner | Other Views | Status |
| --- | --- | --- | --- |
| Song name | Song Setup > Song Details | Generated ID, diagnostics, export readiness read-only | PASS |
| Classification | Song Setup > Song Details | Generated ID, export/manifest summaries read-only | PASS |
| Generated ID | Derived from name and classification | Read-only everywhere | PASS |
| Tempo | Song Setup > Song Details | Timeline and readiness summaries derived | PASS |
| Key | Song Setup > Song Details | Timeline/generation derived | PASS |
| Style | Song Setup > Song Details | Readiness summaries derived | PASS |
| Notes | Song Setup > Song Details | Export JSON/diagnostics derived | PASS |
| Song Sheet sections | Song Setup > Song Sheet | Available Sections derived populated-only | PASS |
| Song Sequence | Song Setup > Song Sheet | Timeline section labels/colors derived | PASS |
| Generated/manual notes | Octave Timeline canvas and generation services | Counts/readiness/diagnostics derived | PASS |
| Instrument settings | Instruments tab | Octave Timeline quick row is select/mute/solo/hide only | PASS |
| Instrument lifecycle | Existing instrument workflow controls | Canonical lane order and selectedInstrumentId derived | PASS |
| Effects/advanced useful settings | Instruments tab | SoundFont/Fast Synth preview consumes derived settings | PASS |
| Preview engine | Export/audio settings owner | Playback status derived | PASS |
| Rendered Save WAV/MP3/OGG | Export tab | Readiness/status derived | PASS |
| MIDI source inspection/import | MIDI Import tab | Diagnostics/status derived | PASS |
| JSON import/export | Tool nav in tool mode; Workspace Manager in workspace mode | Diagnostics/export details derived | PASS |
| Diagnostics | Diagnostics tab | Read-only except explicit Copy/Clear actions | PASS |
| Workspace handoff payload | Workspace Manager connected launch | MIDI Studio marks dirty canonical payload | PASS |

## Duplicate Ownership Review

Targeted Playwright collected visible control ownership across Song Setup, Octave Timeline, Instruments, MIDI Import, Diagnostics, and Export. No duplicate editable canonical owner remained.
