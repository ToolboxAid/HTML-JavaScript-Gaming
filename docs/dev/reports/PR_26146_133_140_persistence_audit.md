# PR_26146_133-140 Persistence Audit

Status: PASS

Implemented:
- Import now accepts wrapped `html-js-gaming.tool-state` JSON exported by MIDI Studio V2.
- Import now accepts normalized Workspace Manager tool-state objects shaped as `workspace/data/dirty`.
- `previewLaneSettings` are preserved through canonical song normalization instead of falling back to `previewInstruments` only.
- Import, Export JSON, and Save Project emit visible PASS status lines while preserving existing OK/WARN/FAIL log behavior.

Tool-only Import/Export JSON:
- PASS exported `toolState.payload.songs[]` retained:
  - song name
  - classification
  - generated ID
  - Song Sheet sections
  - Song Sequence
  - generated/manual lane content
  - instrument volume/pan/transpose settings
  - rendered target metadata
- PASS reimport of the exported tool-state restored the canonical payload from JSON alone.
- PASS targeted Playwright verified no `workspace.tools.midi-studio-v2` sessionStorage dependency in tool mode.

Workspace handoff:
- PASS launch from Workspace Manager hides tool-only import/save controls and shows Return to Workspace.
- PASS edits to classification, generated ID, Song Sheet sequence, instrument settings, and manual notes update:
  - `sessionStorage["workspace.tools.midi-studio-v2"].data`
  - `sessionStorage[hostContextId].tools["midi-studio-v2"]`
- PASS dirty metadata records changed keys and final edit reason.

Residual risk:
- WARN broad `npm run test:workspace-v2` timed out, so only the targeted MIDI Studio handoff slice is confirmed in this lane.
