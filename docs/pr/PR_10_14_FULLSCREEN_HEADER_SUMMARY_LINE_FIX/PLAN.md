# PLAN_PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX

## Purpose
Fix the fullscreen tool header summary layout without changing normal-screen behavior.

## Problem
The previous fullscreen-path fix allowed the platform summary/error header to appear in both normal screen and fullscreen. In fullscreen, the collapsible caret must remain on the same line as the tool name/description.

## Scope
- Only adjust fullscreen header/summary presentation.
- Keep normal screen layout unchanged.
- Ensure the collapsible caret and summary text share one line in fullscreen.
- Preserve platform summary diagnostics, but do not let diagnostics visually replace the normal header in non-fullscreen mode.
- Do not change tool data, manifests, registry content, or tool implementations except where required for header rendering/layout.
- Do not modify start_of_day folders.

## Acceptance
- Normal screen does not show the fullscreen-specific summary/error header treatment.
- Fullscreen header displays caret, tool name, and short description on the same line.
- If header metadata is missing, the diagnostic remains available without breaking the one-line fullscreen header.
- No changes to unrelated tools or data.
