MODEL: GPT-5.3-codex
REASONING: low

PR purpose:
Fix the remaining fullscreen-only Header and Intro blocker.

Problem:
Prior changes had no visible effect in fullscreen mode. Find and fix the actual fullscreen render path.

Scope:
- fullscreen header rendering
- fullscreen intro rendering
- shared platform shell fullscreen path
- tool metadata binding for fullscreen

Do not modify:
- King of the Iceberg files
- sample games
- runtime engine files
- start_of_day folders

Required visible fullscreen behavior:
Header:
<Tool Name> — <Short Description>

Intro:
<Tool Name>: <one-line usage/help text>

Both must include the active tool name.

Implementation requirements:
- Identify actual fullscreen DOM elements.
- Bind fullscreen DOM to active tool metadata.
- Update on launch, entering fullscreen, and tool switch.
- Do not use stale normal-mode content.
- Do not silently fallback to generic intro text.
- If metadata missing, show actionable configuration error.
- Add explicit intro metadata to registry if needed.

Validate tools:
- Vector Map Editor
- Vector Asset Studio
- Sprite Editor
- State Inspector
- Asset Browser if it uses shared fullscreen shell

Targeted validation only:
- node --check changed JS files only.
- Do not run long samples suite.

Create evidence:
tmp/pr_tool_uat_fix_fullscreen_header_wiring_validation.json

Create report:
docs/dev/reports/PR_tool_uat_fix_fullscreen_header_wiring_report.md

Report:
- PASS/FAIL
- changed files
- root cause
- fullscreen DOM path fixed
- visible fullscreen header text per tool
- visible fullscreen intro text per tool
- validation commands/results
- remaining issues
