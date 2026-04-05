Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

# Codex Commands

## Recommended Model
- Model: GPT-5.4
- Reasoning: high

## Primary Command
Create BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS as a docs-only, repo-structured delta.

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- No implementation code in the bundle
- One PR per purpose
- Preserve exact repo-relative structure inside the ZIP
- Place outputs under docs/pr and docs/dev
- Use docs/dev/codex_commands.md and docs/dev/commit_comment.txt
- Output ZIP path:
  - HTML-JavaScript-Gaming-main/tmp/BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS_delta.zip

Deliverables:
- docs/pr/BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/change_summary.txt
- docs/dev/validation_checklist.txt
- docs/dev/file_tree.txt

Next command:
- APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS
