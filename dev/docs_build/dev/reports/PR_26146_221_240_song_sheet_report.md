# PR_26146_221_240 Song Setup and Song Sheet Report

Status: PASS

Verified:
- PASS Classification remains human-entered in Song Details.
- PASS generated ID remains `camelCase(Name) + "-" + Classification`.
- PASS generated ID is read-only/derived.
- PASS classification help remains visible and useful.
- PASS Intro, Verse, Chorus, Bridge, Outro, and Custom sections are supported.
- PASS empty sections are not shown as populated Available Sections.
- PASS populated Available Sections show metrics.
- PASS Song Sequence supports Add, Duplicate, Move Up, Move Down, and Remove.
- PASS Parse Guided Song Sheet updates canonical model, Octave Timeline, diagnostics, JSON Details, and status.
- PASS Regenerate Arrangement warns on manual notes before overwriting and reports results.

Stale State:
- PASS no stale Song Sheet state was observed after parse/regenerate in targeted UAT.
- PASS sequence rejection of missing/unpopulated sections remains covered.

Ownership:
- PASS Song Details owns song metadata.
- PASS Song Sheet owns musical sections, sequence, generation targets, parse, and regenerate.
- PASS Warnings and Diagnostics remain derived surfaces.

Remaining Future:
- FUTURE sequence drag/drop remains red/unwired.
- FUTURE history/snapshot controls remain red/unwired.

