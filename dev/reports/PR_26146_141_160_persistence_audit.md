# PR_26146_141-160 Persistence Audit

## JSON Import

PASS: Tool-only Import JSON loads the canonical MIDI Studio payload.

PASS: Wrapped `midi-studio-v2` toolState payloads remain accepted from prior baseline.

PASS: Invalid and missing data handling remains visible through status/diagnostics surfaces.

## Canonical Edits Persisted

PASS: Export JSON preserves:

- songs
- Name and Classification
- generated ID
- Song Sheet sections
- Song Sequence
- instruments and settings
- generated/manual notes
- Game Usage assignments
- export metadata

## Round Trip

PASS: Exported toolState JSON can be reimported and restores the selected song, Classification, generated ID, Song Sequence, usage assignments, and instrument settings.

PASS: No correctness dependency on `localStorage` was required by the targeted UAT flow.

## Workspace Handoff

PASS: Workspace launch writes edited canonical payload into the workspace tool state and host context.

PASS: Workspace launch shows Return to Workspace and hides tool-only Import/Export JSON controls.

PASS: Tool-only launch shows Import JSON and Export JSON workflows.

