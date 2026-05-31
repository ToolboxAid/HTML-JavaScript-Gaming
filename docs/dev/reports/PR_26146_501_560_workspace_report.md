# PR_26146_501_560 Workspace Report

## Tool-Only Launch

- PASS: tool-mode Import JSON workflow remains visible.
- PASS: Export JSON remains available from tool mode.
- PASS: production signoff Playwright imports, edits, exports, and reimports the canonical MIDI payload.

## Workspace Launch

- PASS: workspace launch sets `data-midi-studio-launch-mode="workspace"`.
- PASS: Return to Workspace is visible.
- PASS: standalone `#saveProjectButton` is hidden.
- PASS: standalone `#toolImportManifestButton` is hidden.
- PASS: canvas note edit marks the workspace session dirty through `workspace.tools.midi-studio-v2`.

## Ownership

Workspace Manager remains save owner for connected launches. MIDI Studio V2 keeps canonical payload edits available for handoff without exposing standalone project save controls in workspace mode.
