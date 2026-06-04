# PLAN_PR_10_15_FULLSCREEN_HEADER_STATE_TEXT_FIX

## Purpose
Correct fullscreen header summary text based on expanded/collapsed state.

## Problem
After PR_10_14, fullscreen summary is on one line, but the text still needs exact state-aware behavior:
- Expanded/open header: summary must say `Hide Header and Details`
- Collapsed fullscreen header: summary must say `<tool> — <details>`
- Collapsed fullscreen summary must remain one line with max width constrained to screen width.

## Scope
- Shared platform header/summary behavior only.
- Fullscreen header summary text/state handling only.
- No normal-screen behavior changes except avoiding regressions from fullscreen state logic.
- No tool data, registry, manifest, or start_of_day changes.

## Acceptance
- In fullscreen with header/details open, summary reads exactly: `Hide Header and Details`
- In fullscreen when collapsed, summary reads exactly as the compact tool identity line: `<tool name> — <tool shortDescription>`
- Collapsed fullscreen summary has no inserted CR/NL and renders on the same line.
- Collapsed fullscreen summary is constrained to viewport/screen width with safe truncation/wrapping prevention.
- The native disclosure/caret remains on the same line as summary text.
- Diagnostics remain available without replacing the summary line.
