# REPORT_PR_10_16_FULLSCREEN_EXIT_STATE_RESTORE_FIX

## Bundle Summary
This PR fixes the shell getting stuck in fullscreen presentation after clicking Exit Fullscreen.

## Target Behavior
- Exit Fullscreen returns to browser-window mode.
- Escape/browser fullscreen exit uses same cleanup path.
- No fullscreen-only markers remain after exit.
- Header/details return to normal mode.

## Expected Codex Output
- Surgical shared-platform fullscreen state fix.
- Validation evidence for both exit paths.
