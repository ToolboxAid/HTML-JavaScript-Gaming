# Codex Commands - PR_26126_007-preview-generator-v2-radio-contract

```bash
codex run "Create PR_26126_007-preview-generator-v2-radio-contract. Update Preview Generator V2 design docs to explicitly require native HTML radio inputs for target selection using <input type=\"radio\" name=\"group1\" value=\"...\"> pattern. Define that all target modes (e.g., Game) must use this radio group, no custom UI controls, no dropdowns, no toggles. Specify that selection drives destination schema behavior (e.g., Game updates asset-browser schema JSON preview field). Reinforce no fallback and no schema ownership. No implementation code. Do not modify samples. Produce review artifacts."
```

## Validation Commands

```bash
git diff --check -- docs/pr/PR_26126_002-preview-tool-detailed-design.md docs/pr/PR_26126_003-preview-tool-layout-spec.md docs/dev/codex_commands.md docs/dev/commit_comment.txt
rg -n 'name="group1"|previewTargetModeGame|dropdowns|toggles|asset-browser.schema.json|preview-generator-v2.schema.json' docs/pr/PR_26126_002-preview-tool-detailed-design.md docs/pr/PR_26126_003-preview-tool-layout-spec.md
npm run codex:review-artifacts
```

## Playwright

No Playwright impact. This PR is a documentation-only radio contract correction and does not modify implementation code.

## Full Samples

Full samples smoke test was skipped because this PR is documentation-only and sample files are out of scope.
