# Codex Commands - PR_26126_005-preview-generator-v2-naming

```bash
codex run "Create PR_26126_005-preview-generator-v2-naming. Update all Preview Generator V2 design docs to use the official name \"Preview Generator V2\". Ensure consistency across title, header (platformShell shortDescription usage), layout spec, and references to the tool. Do not change functionality. Do not modify samples. Update docs/pr files and produce review artifacts."
```

## Validation Commands

```bash
git diff --check -- docs/pr/PR_26126_002-preview-tool-detailed-design.md docs/pr/PR_26126_003-preview-tool-layout-spec.md docs/dev/codex_commands.md docs/dev/commit_comment.txt
npm run codex:review-artifacts
```

## Playwright

No Playwright impact. This PR is a documentation naming consistency pass and does not modify implementation code.

## Full Samples

Full samples smoke test was skipped because this PR is documentation-only and sample files are out of scope.
