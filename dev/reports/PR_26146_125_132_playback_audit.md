# PR_26146_125-132 Playback Audit

## PASS
- Global Play starts audible preview from the selected canonical song model.
- Natural completion returns Play to enabled and Stop to disabled.
- Loop mode shows looping status and advances the playhead.
- Stop clears active playback and returns controls to the stopped state.
- Section header selection from the timeline synchronizes to the Song Sequence selection.
- Canvas edits are included in playable timeline data.
- Instrument audition keyboard uses the selected instrument and range/settings from Instruments tab ownership.

## Covered By Playwright
- `validates PR125-132 codebase completion SSoT song sheet timeline instruments playback and export`
- `validates PR125-132 workspace and tool launch ownership split`

## WARN
- The broader Workspace Manager V2 suite did not complete through the required lane wrapper. No playback-specific failure was observed in the targeted MIDI Studio validation.
