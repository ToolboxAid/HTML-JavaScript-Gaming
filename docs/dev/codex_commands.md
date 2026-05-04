# Codex Commands - PR_26124_074-sample-palette-json-audit-and-fix

```bash
npx @openai/codex run --model gpt-5.5 --reasoning high "Run full workflow for PR_26124_074-sample-palette-json-audit-and-fix. Follow PROJECT_INSTRUCTIONS.md exactly."
```

## Validation Commands

```bash
node --input-type=module <sample palette JSON audit/fix>
node --input-type=module <sample palette JSON validation>
git diff --check
npm run test:workspace-v2
npm run codex:review-artifacts
```

## Playwright

No targeted Playwright impact is expected because this PR changes sample palette JSON data only. The default requested gate is `npm run test:workspace-v2`.

`npm run test:workspace-v2` failed because `package.json` does not define the `test:workspace-v2` script.

## Full Samples

Full samples smoke test was skipped by instruction.
