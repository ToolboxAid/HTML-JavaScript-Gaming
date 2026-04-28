MODEL: GPT-5.3-codex
REASONING: low

PR purpose:
Fix remaining shared-shell header issues:
1. Parallax Scene Studio shows configuration error because required metadata is missing.
2. After exiting fullscreen, generic toggle text says "Hide Header and Details".

Do not modify KOTI files.
Do not modify sample games.
Do not modify runtime engine files.
Do not modify start_of_day folders.
Do not run long samples suite.

Fix Parallax Scene Studio metadata:
- Find actual tool id in toolRegistry.js.
- Add/verify:
  name
  shortDescription
  intro or equivalent one-line help text
- Suggested:
  name: "Parallax Scene Studio"
  shortDescription: "Layered Scene & Depth Composition"
  intro: "Parallax Scene Studio: compose layered backgrounds, midgrounds, and foreground scene depth."

Fix toggle text:
- Replace generic "Hide Header and Details" / "Show Header and Details" with tool-specific text:
  Hide <Tool Name> Details
  Show <Tool Name> Details
- Ensure it updates on page load, metadata bind, enter fullscreen, exit fullscreen, collapse/expand.
- Do not use CSS-only masking.
- Shared shell remains source of truth.

Missing metadata:
- Keep actionable configuration error for genuinely incomplete metadata.
- Error must name tool id and missing field.

Validation:
- node --check tools/shared/platformShell.js
- node --check tools/toolRegistry.js
- browser validate Parallax Scene Studio normal mode, fullscreen, exit fullscreen.
- Search visible DOM/text for:
  Header and Intro
  Hide Header and Details
  Show Header and Details

Create evidence:
tmp/pr_tool_fix_parallax_header_metadata_validation.json

Create report:
docs/dev/reports/PR_tool_fix_parallax_header_metadata_report.md

Report:
- PASS/FAIL
- changed files
- metadata fixed
- toggle text after exit fullscreen
- validation commands/results
- remaining issues
