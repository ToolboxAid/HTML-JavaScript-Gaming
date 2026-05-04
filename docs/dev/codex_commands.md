# Codex Commands - PR_26124_075-palette-browser-launch-registration-fix

```bash
npx @openai/codex run --model gpt-5.5 --reasoning high "Run full workflow for PR_26124_075-palette-browser-launch-registration-fix. Follow PROJECT_INSTRUCTIONS.md exactly."
```

## Validation Commands

```bash
node --input-type=module <sample metadata registry validation>
node --input-type=module <targeted Samples index launch validation>
git diff --check
npm run test:workspace-v2
npm run codex:review-artifacts
```

## Playwright

Targeted Samples index launch validation confirms palette-backed samples no longer render `Tool "palette-browser" is not registered in toolRegistry.` and their launch links resolve to Palette Manager V2.

`npm run test:workspace-v2` failed because `package.json` does not define the `test:workspace-v2` script.

## Full Samples

Full samples smoke test was skipped by instruction.
