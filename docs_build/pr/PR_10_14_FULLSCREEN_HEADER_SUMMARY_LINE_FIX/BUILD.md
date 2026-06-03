# BUILD_PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX

## Required Codex Work

### 1. Locate fullscreen header path
Inspect only the shared platform/header files involved in fullscreen tool rendering, expected around:
- tools/shared/platformShell.js
- tools/shared/platformShell.css
- tools/toolRegistry.js only for read/validation, not broad edits

### 2. Restrict visual behavior to fullscreen
Ensure any `[data-tools-platform-summary]`, `[data-tools-platform-summary-active]`, or `[data-tools-platform-summary-error]` styling/activation that was intended for fullscreen does not alter normal-screen header presentation.

### 3. One-line fullscreen summary
In fullscreen mode:
- `<summary class="is-collapsible__summary">` must render as one horizontal row.
- The native disclosure/caret must remain on the same line as the tool title/description.
- The summary content should not stack into multiple visual lines unless viewport width forces wrapping.
- Error text must not push the caret onto a separate line.

### 4. Diagnostics behavior
If `tool.name` or `tool.shortDescription` is missing:
- Keep a title/diagnostic signal available.
- Do not replace the fullscreen header line with a multi-line error block.
- Do not change registry data unless explicitly required by existing validation rules.

### 5. Validation report
Create a report at:
docs_build/dev/reports/PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX_report.md

Report must include:
- Files changed
- Exact behavior before/after
- Manual validation steps for normal mode and fullscreen mode
- Confirmation no data/schema/start_of_day changes were made

## Constraints
- Smallest scoped valid change.
- No implementation rewrite.
- No repo-wide scanning.
- No unrelated UI polish.
- No data fixes.
