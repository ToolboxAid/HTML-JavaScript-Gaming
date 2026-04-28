# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_10_16_FULLSCREEN_EXIT_STATE_RESTORE_FIX.

Required:
- Fix Exit Fullscreen so the shell returns to normal browser-window layout.
- Ensure button exit and Escape/browser fullscreenchange exit share the same cleanup path.
- Clear all fullscreen classes, data attributes, cached flags, and compact summary state.
- Restore normal header/details behavior after exit.
- Do not modify tool data, manifests, registry entries, or start_of_day folders.
- Add validation report at docs/dev/reports/PR_10_16_FULLSCREEN_EXIT_STATE_RESTORE_FIX_report.md.
- Return ZIP artifact at tmp/PR_10_16_FULLSCREEN_EXIT_STATE_RESTORE_FIX_delta.zip.
