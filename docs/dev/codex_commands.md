# Codex Commands - PR_26126_008-preview-generator-v2-first-pass

```bash
codex run "Create PR_26126_008-preview-generator-v2-first-pass. Build Preview Generator V2 in one pass using Palette Manager as the base layout/code pattern. Use the exact Palette Manager platform header and NAV style. NAV buttons must be Generate Preview, Apply to Game, Export Image, with Generate Preview in NAV. Do not show JSON UI. Preview Generator V2 owns no schema. Implement native radio target selection with name=\"previewTarget\" and values including game. Build 3-column UI: left target/source/status, center main preview plus Last Generated Preview at bottom, right render/output controls. For Game target, generated preview should update asset-browser-compatible destination data for that game, validated against the destination schema only. No fallback data, no hidden defaults, no partial render on invalid destination data. Include targeted Playwright coverage for skeleton render, radio selection, generate/apply/export button states, and no visible JSON controls. Do not modify samples. Produce review artifacts."
```

## Validation Commands

```bash
node --check tools/preview/main.js
node --check tools/preview/previewGeneratorShell.js
node --check tests/tools/PreviewGeneratorV2FirstPass.test.mjs
node tests/tools/PreviewGeneratorV2FirstPass.test.mjs
git diff --check -- tools/preview/index.html tools/preview/main.js tools/preview/previewGeneratorShell.js tools/preview/previewGeneratorV2.css tests/tools/PreviewGeneratorV2FirstPass.test.mjs docs/dev/codex_commands.md docs/dev/commit_comment.txt
npm run codex:review-artifacts
```

## Playwright

Targeted Playwright coverage is in `tests/tools/PreviewGeneratorV2FirstPass.test.mjs`.

## Full Samples

Full samples smoke test was skipped because this PR is scoped to the Preview Generator V2 tool and targeted Playwright coverage.
