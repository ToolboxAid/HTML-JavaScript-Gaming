MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
1. Run full validation:
   npm test
   node ./scripts/run-node-tests.mjs
   npm run test:launch-smoke

2. If all pass:
   Update roadmap:
   Track A → [x]
   Track C → [x]
   Track F → [x]

3. If any fail:
   create report:
   docs/dev/reports/validation_failures.md

4. Package:
   <project folder>/tmp/BUILD_PR_LEVEL_19_11_FULL_VALIDATION_AND_PROMOTION.zip

CONSTRAINTS:
- Do not force pass
- Only promote if clean
