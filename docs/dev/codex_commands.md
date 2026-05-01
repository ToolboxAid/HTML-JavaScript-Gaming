# Codex Commands — PR_11_188B Palette Manager v2 Header Alignment

## Model
GPT-5.4-codex

## Reasoning
high

## Command
```text
Apply PR_11_188B Palette Manager v2 header alignment.

Read docs/pr/PR_11_188B_PALETTE_MANAGER_V2_HEADER_ALIGNMENT.md.

Implement only the smallest valid Palette Manager v2 change so the tool page uses the same shared theme header mount as /index.html:
- include/reuse <div id="shared-theme-header"></div>
- reuse src/engine/theme behavior already used by /index.html
- preserve existing accordion behavior
- keep menuTool and menuWorkspace separated
- keep session-backed data only
- no fallback/default data
- no platformShell
- no tools/shared/*
- no Workspace Manager v1
- no schema, sample, or game changes
- no helper classes, abstraction layers, alias variables, or pass-through remaps

Validation:
1. Run syntax checks on changed Palette Manager v2 files only.
2. Run targeted Palette Manager v2 launch/check only.
3. Do not run full samples smoke test.

Write results to docs/dev/reports/PR_11_188B_palette_manager_v2_header_alignment_report.md.
Update docs/dev/commit_comment.txt with the required commit comment.
Create a final repo-structured ZIP at:
tmp/PR_11_188B_20260501_01.zip
```
