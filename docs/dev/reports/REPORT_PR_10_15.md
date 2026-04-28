# REPORT_PR_10_15_FULLSCREEN_HEADER_STATE_TEXT_FIX

## Bundle Summary
This PR narrows the fullscreen header behavior to exact state-based summary text.

## Target Behavior
- Fullscreen expanded/open: `Hide Header and Details`
- Fullscreen collapsed: `<tool name> — <tool shortDescription>`
- Collapsed text stays on one line, constrained to viewport width.
- Diagnostics remain non-disruptive.

## Expected Codex Output
- Surgical shared-platform change only.
- Validation evidence for normal, fullscreen expanded, and fullscreen collapsed states.
