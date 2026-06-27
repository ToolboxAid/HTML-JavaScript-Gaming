# PR_26146_033 MIDI Studio V2 Implementation Audit

## Highest Actually Applied MIDI Studio V2 PR

Highest evidence-backed applied PR: `PR_26146_032-midi-studio-v2-fast-note-editing-and-keyboard-flow`.

Evidence:
- `docs_build/dev/reports/PR_26146_032-midi-studio-v2-fast-note-editing-and-keyboard-flow_validation.md` exists and reports PASS.
- `toolbox/midi-studio-v2/js/MidiStudioV2App.js` includes Space/Delete/Backspace/Arrow/Ctrl+D keyboard shortcut handling.
- `toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js` includes pointer drag note painting, selected-cell highlighting, scroll-state preservation, duplicate/delete selection methods, and post-drag click suppression repair.
- `tests/playwright/tools/MidiStudioV2.spec.mjs` includes the fast octave note editing Playwright test.

## Implemented

- First-class MIDI Studio V2 shell, external CSS/JS wiring, template-style panels, accordions, status log, and action nav.
- Import JSON Manifest flow with multi-song MIDI Studio fixture support.
- Studio tab as primary surface with visible octave timeline editor.
- Song list and instrument list in the left panel.
- Guided Song Sheet fields for tempo, key, style, intro progression, and loop progression.
- MIDI source import and inspection, including editable-grid conversion.
- Editable octave grid click-to-toggle note editing.
- Drag note painting across timeline cells and horizontal duration-style extension by painting adjacent cells.
- Multi-note/chord editing and simultaneous notes in a beat column.
- Keyboard shortcuts: Space Play/Stop, Delete/Backspace remove selected note, Arrow keys move selection, Ctrl/Cmd+D duplicate selected note.
- Visible selected-note highlight, editable-cell hover highlight, selected-lane dominance, and dimmed non-selected notes.
- Preview Synth playback, section/loop timing preview, stop behavior, and playhead alignment by beat/bar.
- GM Type and Instrument dropdowns with expanded Preview Synth mappings.
- Auto-Create Parts helpers for generated bass, pad, arpeggio, and drums are implemented and Playwright-covered. Roadmap moved only `[ ]` to `[.]` in this PR because the roadmap guard prohibits direct `[ ]` to `[x]`.
- Audio diagnostics for selected song, selected section, playable note count, active lanes, lane visibility/mute/solo/volume/pan summaries, current preview pack, and last playback error.
- 350px normal left Songs/Instruments column with fitting Type/Instrument dropdowns and one-line Mute/Solo/Eye/Delete icon row.

## Partially Implemented

- Track volume and pan controls: data/state support exists and old lane-header creation code still creates volume/pan controls, but the default octave timeline left Instruments list exposes Mute, Solo, Eye, and Delete only. Existing roadmap marker remains unchanged because roadmap guard does not allow downgrades.
- Rendered audio support: rendered preview playback can play declared WAV/MP3/OGG targets, but export rendering still logs not implemented.
- ToolState workflow: JSON export/copy and serializer validation exist; broader Workspace Manager save/cancel lifecycle behavior was not re-audited in this PR.
- Optional per-note duration: horizontal drag paints adjacent cells for visible duration-style editing, but there is no persisted note-duration metadata model.

## Not Implemented

- Rendered WAV/MP3/OGG export rendering.
- SoundFont playback or real instrument playback.
- DAW mixer complexity.
- Automation lanes.
- Optional piano roll.
- Optional advanced MIDI event editor beyond the current octave grid and hidden advanced lane-source text.
- Per-note velocity editing.
- Arrangement section copy/paste helpers.
- Quantize and humanize helpers.

## Broken/UAT-Blocking

No current UAT-blocking MIDI Studio V2 runtime issues were found in the audited files.

Fixed in this PR:
- The normal left Songs/Instruments column previously used `calc(14rem + 350px)` to `calc(18rem + 350px)` and was not actually 350px wide.
- The existing left-column Playwright assertion expected at least 560px, so it did not protect the required 350px layout.

Known non-blocking gap:
- The roadmap marker for track volume/pan/mute/solo is more optimistic than the current default octave timeline UI because volume/pan are not visible in the left Instruments list.

## Playwright-Covered

- UAT manifest import and multi-song selection.
- Default octave editor visibility and playable Studio workflow.
- Selected instrument note dominance and non-selected note dimming.
- Click-to-toggle note editing.
- Drag note painting and horizontal note extension.
- Chord/simultaneous note editing.
- Keyboard shortcuts for Play/Stop, deletion, selection movement, and duplication.
- Timeline scroll sync and no unexpected scroll jumps during editing.
- Compact icon-only instrument controls and tooltips.
- GM Type and Instrument dropdown usability.
- Preview Synth play/stop and timing playhead alignment.
- Auto-Create Parts helper generation for bass, pad, arpeggio, and drums.
- Guided Song Sheet valid and invalid paths.
- MIDI source inspection and local import.
- Invalid payload rejection before render.
- Roadmap/audit report existence and expected status markers for this PR.

## Manual-UAT-Needed

- Real browser audio behavior outside the mocked Playwright Web Audio/HTMLAudio environment.
- Real-device pointer dragging on touchpads and high-DPI screens.
- Manual confirmation that the 350px left column remains comfortable across expected desktop viewport sizes.
- Full Workspace Manager lifecycle save/cancel/reopen flow for MIDI Studio V2 toolState.
- Cross-browser shortcut behavior, especially Cmd+D on macOS.
- Any future SoundFont, export rendering, velocity, piano roll, automation, or mixer work.

## UNKNOWN

- Whether every prior ChatGPT PR command was executed exactly as written; this audit only trusts current files and repo reports.
- Whether external user UAT outside the repo passed for every prior MIDI Studio V2 PR.
- Whether sample JSON launch works end-to-end; sample validation remains explicitly out of scope until sample alignment.
