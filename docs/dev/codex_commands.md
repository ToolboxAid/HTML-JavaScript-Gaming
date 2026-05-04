# Codex Commands - PR_26124_077-palette-manager-final-exit-pass

```bash
npx @openai/codex run --model gpt-5.5 --reasoning high "Run full workflow for PR_26124_077-palette-manager-final-exit-pass. Follow PROJECT_INSTRUCTIONS.md exactly."
```

## Validation Commands

```bash
node --check tools/palette-manager-v2/main.js
node --check tools/palette-manager-v2/paletteManagerShell.js
node --check tools/palette-manager-v2/modules/PaletteManagerApp.js
node tests/tools/PaletteManagerV2Baseline.test.mjs
node --input-type=module <targeted Palette Manager V2 exit-pass audit>
node --input-type=module <targeted Palette Manager V2 URL preset validation>
git diff --check
npm run test:workspace-v2
npm run codex:review-artifacts
```

## Playwright

Targeted Palette Manager V2 validation confirms baseline controls, validation clear placement, pin scroll preservation, Tag sort untagged-last behavior, and URL preset loading remain stable.

`npm run test:workspace-v2` failed because `package.json` does not define the `test:workspace-v2` script.

## Full Samples

Full samples smoke test was skipped by instruction.
