# PR_26146_161_200 Song Setup Report

Status: PASS

Verified:
- Import JSON loads canonical MIDI Studio payload.
- Name and Classification update the generated ID as `camelCase(Name) + "-" + Classification`.
- Generated ID remains read-only.
- Classification help includes useful game-music examples.
- Tempo, Key, Style, and Notes update the selected canonical song.
- Warnings remain outside the Song Sheet section model.
- Game Usage assignment remains separate from Classification metadata.

Song Sheet:
- Intro, Verse, Chorus, Bridge, Outro, and custom sections remain first-class editors.
- Empty sections do not appear as populated Available Sections.
- Disabled empty-state guidance remains visible and actionable.
- Populated sections show bar/chord metrics.
- Section templates apply as editable starting points.
- Section Library Save/Load/Duplicate changes canonical Song Sheet data only when valid.

Sequence and Generation:
- Song Sequence supports Add, Duplicate, Move Up, Move Down, and Remove.
- Missing/unpopulated sequence entries are rejected with visible FAIL status.
- Parse Guided Song Sheet updates canonical model, timeline, diagnostics, JSON Details, summaries, and status.
- Regenerate Arrangement shows manual-note overwrite warning and requires confirmation.
