# Codex Commands - PR_26126_002-preview-tool-detailed-design

```bash
codex run "Create PR_26126_002-preview-tool-detailed-design. Add a detailed design document for tools/preview/index.html covering capabilities, UI regions, control placement, input/output contracts, error states, preview modes, and export actions. No implementation code. Do not modify samples. Place design under docs/pr/PR_26126_002-preview-tool-detailed-design.md and produce required review artifacts."
```

## Validation Commands

```bash
git diff --check -- docs/pr/PR_26126_002-preview-tool-detailed-design.md docs/dev/codex_commands.md docs/dev/commit_comment.txt
npm run codex:review-artifacts
```

## Playwright

No Playwright impact. This PR is a documentation/design-only PR for the Preview tool and does not modify implementation code.

## Full Samples

Full samples smoke test was skipped because this PR is documentation-only and sample files are out of scope.
