# BUILD_PR_10_15_FULLSCREEN_HEADER_STATE_TEXT_FIX

## Required Codex Work

### 1. State-aware summary label
Update shared platform header code so fullscreen summary text is driven by open/collapsed state:
- If fullscreen header/details are open: `Hide Header and Details`
- If fullscreen header/details are collapsed: `<tool name> — <tool shortDescription>`

### 2. No CR/NL in collapsed fullscreen summary
Ensure collapsed fullscreen summary is produced as a single inline text value:
- no line breaks
- no stacked span layout
- no visible error row
- no hidden block element affecting line layout

### 3. Width behavior
For collapsed fullscreen summary:
- maximum visible width must not exceed viewport/screen width
- apply safe inline truncation if needed
- caret must remain on the same line as text

### 4. Diagnostics
If metadata is missing:
- preserve diagnostic via title/data attribute
- do not replace fullscreen summary with a multi-line visible error block
- do not edit registry/tool data to hide the issue

### 5. Validation report
Create:
docs_build/dev/reports/PR_10_15_FULLSCREEN_HEADER_STATE_TEXT_FIX_report.md

Report must include:
- changed files
- exact state behavior verified
- normal mode validation
- fullscreen expanded validation
- fullscreen collapsed validation
- confirmation no data/schema/start_of_day changes

## Constraints
- Smallest scoped valid change.
- No implementation rewrite.
- No unrelated UI cleanup.
- No repo-wide scanning.
- No data fixes.
