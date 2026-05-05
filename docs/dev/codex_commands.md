# Codex Commands - PR_26126_004-preview-tool-layout-refinement

```bash
codex run "Create PR_26126_004-preview-tool-layout-refinement. Update the preview tool layout spec to explicitly use Palette Manager as the base layout and interaction pattern (panel structure, control grouping, header usage). Add requirement: center column must include a 'last generated preview' section at the bottom showing the most recent rendered image. Define its placement, sizing, and behavior (replaces on new render, no history, no fallback). Keep strict JSON input rules. No implementation code. Do not modify samples. Update docs/pr/PR_26126_003-preview-tool-layout-spec.md and produce review artifacts."
```

## Validation Commands

```bash
git diff --check -- docs/pr/PR_26126_003-preview-tool-layout-spec.md docs/dev/codex_commands.md docs/dev/commit_comment.txt
npm run codex:review-artifacts
```

## Playwright

No Playwright impact. This PR refines documentation/layout specification only and does not modify implementation code.

## Full Samples

Full samples smoke test was skipped because this PR is documentation-only and sample files are out of scope.
