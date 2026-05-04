# Codex Commands - PR_26124_073-palette-manager-playwright-baseline

```bash
npx @openai/codex run --model gpt-5.5 --reasoning high "Run full workflow for PR_26124_073-palette-manager-playwright-baseline. Follow PROJECT_INSTRUCTIONS.md exactly."
```

## Validation Commands

```bash
node --check tests/tools/PaletteManagerV2Baseline.test.mjs
node tests/tools/PaletteManagerV2Baseline.test.mjs
git diff --check
npm run test:workspace-v2
npm run codex:review-artifacts
```

## Playwright

The targeted Palette Manager V2 Playwright baseline validates page load, console/runtime cleanliness, menuSample actions, accordion toggles, Validation/Error Viewer Clear placement, source pin scroll preservation, and Tag sort untagged-last behavior.

`npm run test:workspace-v2` failed because `package.json` does not define the `test:workspace-v2` script.

## Full Samples

Full samples smoke test was skipped by instruction.
