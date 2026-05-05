# Codex Commands - PR_26126_010-preview-generator-v2-reskin-correction

```bash
codex run "Create PR_26126_010-preview-generator-v2-reskin-correction. Correct Preview Generator V2 as a reskin of existing preview.html, not a rewrite. Review and preserve all existing preview.html functionality, labels, inputs, ids where possible, and behavior. Regroup the existing controls into the Palette Manager-style layout. Left column must contain: Repo Destination (rename Game Destination; it opens a folder, not a file), Target Source, and Render Controls. Center column must replace Main Preview with Paths or IDs using an input box. Right column must place Status under Output Summary. Header/NAV must remove Apply to Game and Export Image; keep Generate Preview only in the Palette Manager-style NAV. Do not add JSON UI. Do not create a Preview Generator V2 schema. Do not modify samples. Update Playwright/tests only for this corrected reskin behavior. Produce review artifacts."
```

## Validation Commands

```bash
node --check tools/preview-generator-v2/main.js
node --check tools/preview-generator-v2/previewGeneratorShell.js
node --check tests/tools/PreviewGeneratorV2FirstPass.test.mjs
node tests/tools/PreviewGeneratorV2FirstPass.test.mjs
git diff --check -- tools/preview-generator-v2/index.html tools/preview-generator-v2/main.js tools/preview-generator-v2/previewGeneratorShell.js tools/preview-generator-v2/previewGeneratorV2.css tools/toolRegistry.js tests/tools/PreviewGeneratorV2FirstPass.test.mjs docs/dev/codex_commands.md docs/dev/commit_comment.txt
npm run test:workspace-v2
npm run codex:review-artifacts
```

## Notes

`tools/preview/preview_svg_generator.html` was used as the existing preview generator base because there is no literal `preview.html` file in the repository.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2.
