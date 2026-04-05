Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

# Codex Commands

## Recommended Model
- Model: GPT-5.4
- Reasoning: high

## Primary Command
Create BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS as a docs-only, repo-structured delta that fixes all remaining contract gaps in one PR.

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR exactly
- Docs-first only
- No implementation code in the bundle
- One PR purpose only
- Preserve exact repo-relative structure inside the ZIP
- Place outputs under docs/pr and docs/dev
- Use docs/dev/codex_commands.md and docs/dev/commit_comment.txt
- Include docs/dev/next_command.txt
- Respect the repo file-header standard on every created file
- Tighten contract schemas for all 4 tools
- Define the render pipeline formally
- Lock engine mappings explicitly
- Add a validation layer with non-silent rejection rules
- Add a composition layer with a formal composition document schema
- Keep all scope 2D-only and non-destructive
- Output ZIP path:
  - HTML-JavaScript-Gaming-main/tmp/BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS_delta.zip

Required deliverables:
- docs/pr/BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/change_summary.txt
- docs/dev/validation_checklist.txt
- docs/dev/file_tree.txt
- docs/dev/next_command.txt

Hard acceptance targets:
- All four producers have explicit schema sections
- Formal pipeline stages are documented
- Formal render order buckets are documented
- Engine mappings are explicit and locked
- Validation rules reject invalid contracts without silent repair
- Composition manifest schema is documented
- No implementation files are added

Next command:
- APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS
