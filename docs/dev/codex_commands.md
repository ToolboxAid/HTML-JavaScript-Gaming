MODEL: GPT-5.3-codex
REASONING: low

PR purpose:
Fix two Tools UAT blockers only:
1. Fullscreen Header and Intro must include active tool name.
2. Asset Browser sample 0204 must show clear actionable empty/missing/invalid source state.

Do not advance King of the Iceberg work.
Do not modify sample games, runtime engine files, or start_of_day folders.
Do not add new features.

Header/Intro requirements:
- In fullscreen mode, header includes:
  <Tool Name> — <Short Description>
- In fullscreen mode, intro includes:
  <Tool Name>: <one-line usage/help text>
- Keep both compact and single-line where possible.
- Use ellipsis and tooltip/title for overflow.
- If required metadata is missing, show actionable configuration error.
- Do not use silent fallback generic text.

Asset Browser 0204 requirements:
- Inspect launch path/state for sample 0204.
- Current observed text says 0 approved assets from:
  active-project-manifest.tools.asset-browser.assets
- Make UI clearly distinguish:
  - source exists but empty
  - source missing
  - source invalid
  - source load failure
- If source exists but empty, show:
  source checked, result count, and next action.
- Do not auto-load fallback/default/sample assets.

Targeted validation only:
- node --check changed JS files.
- Validate fullscreen header/intro on affected tools.
- Validate Asset Browser sample 0204.
- Do not run long sample suite unless required.

Create report:
docs/dev/reports/PR_tool_uat_fix_header_asset_browser_report.md

Report:
- PASS/FAIL
- changed files
- validation performed
- Asset Browser 0204 observed final state
- remaining issues
