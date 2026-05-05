# Codex Commands - PR_26126_006-preview-generator-v2-action-contract

```bash
codex run "Create PR_26126_006-preview-generator-v2-action-contract. Correct the Preview Generator V2 design docs: Preview Generator V2 must not have its own schema. It launches without knowing the target purpose until the user selects a target radio option. Define the Game radio behavior: when Game is selected and a preview image is generated, the output updates the existing tools/schemas/tools/asset-browser.schema.json-compatible JSON by adding/updating the preview image for that game. Remove any requirement for tools/schemas/tools/preview-generator-v2.schema.json. Keep strict validation against the destination schema. No implementation code. Do not modify samples. Produce review artifacts."
```

## Validation Commands

```bash
git diff --check -- docs/pr/PR_26126_002-preview-tool-detailed-design.md docs/pr/PR_26126_003-preview-tool-layout-spec.md docs/dev/codex_commands.md docs/dev/commit_comment.txt
rg -n 'html-js-gaming\.tool\.preview|Target `toolState`|Preview Generator V2 accepts only its own' docs/pr/PR_26126_002-preview-tool-detailed-design.md docs/pr/PR_26126_003-preview-tool-layout-spec.md
npm run codex:review-artifacts
```

## Playwright

No Playwright impact. This PR is a documentation-only action contract correction and does not modify implementation code.

## Full Samples

Full samples smoke test was skipped because this PR is documentation-only and sample files are out of scope.
