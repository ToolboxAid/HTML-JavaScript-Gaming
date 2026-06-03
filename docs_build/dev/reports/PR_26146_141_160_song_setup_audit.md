# PR_26146_141-160 Song Setup Audit

## Song Details

PASS: Import JSON loads canonical MIDI Studio payload.

PASS: Name, Classification, Tempo, Key, Style, and Notes remain Song Details owned.

PASS: Generated ID updates as `camelCase(Name) + "-" + Classification`.

Verified example:

- Name: `Sky Battle`
- Classification: `Flying`
- Generated ID: `skyBattle-Flying`

PASS: Classification help remains visible with the common examples list.

PASS: Game Usage assignment is separate from Classification metadata.

## Song Sheet

PASS: Intro, Verse, Chorus, Bridge, Outro, and custom section editors remain first-class.

PASS: Empty Bridge is excluded from Available Sections until populated.

PASS: Available Sections shows populated sections with bar/chord metadata.

PASS: Section template insertion works on a populated section.

PASS: Section Library Save, Load, and Duplicate change canonical section data and status honestly.

PASS: Arrangement Templates populate Song Sequence while preserving manual editing after application.

PASS: Add, Duplicate, Move Up, Move Down, and Remove sequence actions are wired and verified.

PASS: Missing/unpopulated sequence items are rejected visibly with FAIL status.

PASS: Parse Guided Song Sheet updates canonical model, Octave Timeline, JSON Details, diagnostics, and status.

PASS: Regenerate Arrangement shows manual note overwrite warning and requires confirmation.

## Empty State Guidance

PASS: Empty/unpopulated sections remain actionable because Available Sections only exposes populated choices and Save Section is disabled for empty selections.

