# PR_26146_065 MIDI Studio V2 UAT Gap Audit

## Scope

- Continued from `PR_26146_064`.
- Audited MIDI Studio V2 visible controls across current tabs only:
  - Song Setup
  - Octave Timeline
  - Instruments
  - Auto-Create Parts
  - MIDI Import
  - Diagnostics
  - Export
- No new features, tabs, or playback architecture changes were added.
- Roadmap status was not changed because this PR is audit/test/reporting only and did not execute a new completion milestone beyond the existing PR064 state.

## Method

- Reviewed current tab/accordion/control layout in `toolbox/midi-studio-v2/index.html`.
- Reviewed immediate MIDI Studio V2 control owners and app handlers:
  - `toolbox/midi-studio-v2/js/MidiStudioV2App.js`
  - `toolbox/midi-studio-v2/js/controls/ActionNavControl.js`
  - `toolbox/midi-studio-v2/js/controls/ExportPanelControl.js`
  - `toolbox/midi-studio-v2/js/controls/RenderedExportActionsControl.js`
  - `toolbox/midi-studio-v2/js/controls/SongDetailsControl.js`
  - `toolbox/midi-studio-v2/js/controls/SongSheetControl.js`
  - `toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`
- Added Playwright UAT inventory coverage that visits each visible tab and classifies controls by owner, canonical field, and wired/unwired status.

## PASS

- PASS - Current tab set remains unchanged: Song Setup, Octave Timeline, Instruments, Auto-Create Parts, MIDI Import, Diagnostics, Export.
- PASS - Playwright PR065 inventory found no unclassified visible controls in the audited tab surfaces.
- PASS - Visible editable data controls map to canonical fields, or to explicit functional workflow state, or are red/unwired.
- PASS - Unwired/future controls expose shared red unwired styling and title/status text.
- PASS - Song Setup editable controls update canonical song fields for Name, derived Id, Tempo, Key, Style, Notes, Song Sheet Sections, Loop sections, and loop settings.
- PASS - Song Sheet derived values remain display/read-only for Bars, Chord count, Estimated duration, and Warnings.
- PASS - Instruments tab owns editable GM Type, GM Instrument, display name, volume, pan, octave range, transpose, velocity, and duration controls.
- PASS - Effects, Advanced, MIDI Input, Editing History, and future rendering controls remain red/unwired.
- PASS - Export tab owns rendered target path editing and rendered audio save workflow controls.
- PASS - Diagnostics controls are read-only derived displays except explicit diagnostic actions such as Copy JSON and Clear.
- PASS - Canvas Octave Timeline note editing still updates canonical song data and playback reads edited canonical data.
- PASS - Play and Stop still work in targeted MIDI Studio V2 validation.

## WARN

- WARN - A full unfiltered `MidiStudioV2.spec.mjs` Playwright run was attempted and timed out after 15 minutes. Targeted PR060-PR065/export UAT coverage passed after narrowing to the impacted tests.
- WARN - Mute and Solo are intentionally available in both Octave Timeline quick controls and Instruments Mix. They write the same canonical preview lane settings and sync correctly, but product wording still blurs "performance quick controls" vs "default mix settings".
- WARN - Some visible controls are functional workflow state rather than persisted canonical song fields, including timing preview section selectors, Loop playback toggle, and Auto-Create helper lane type. They are classified in the matrix as workflow state instead of model-editing fields.
- WARN - Roadmap text still contains older MIDI Studio V2 ownership wording in places; no status update was made because this PR did not include an execution-backed roadmap milestone change.

## FAIL

- FAIL - None found for the audited PR065 scope.
- FAIL checked and not found - duplicate editable song metadata fields across tabs.
- FAIL checked and not found - derived Song Sheet values exposed as editable controls.
- FAIL checked and not found - visible unwired controls without red/shared unwired styling.
- FAIL checked and not found - editable controls that silently fail to update the canonical model in the sampled UAT checks.

## NEXT

- NEXT - Decide whether Instruments Mix Mute/Solo should remain the same performance state as Octave Timeline quick Mute/Solo or become separate persisted defaults with distinct canonical fields.
- NEXT - Consider adding UI copy or data attributes that distinguish transient workflow controls from canonical model editors.
- NEXT - Split the large MIDI Studio V2 Playwright file into smaller targeted shards if whole-file execution continues exceeding practical local timeouts.
- NEXT - Refresh roadmap wording in a dedicated status/text cleanup PR if the owner wants roadmap prose aligned to current tab ownership.
