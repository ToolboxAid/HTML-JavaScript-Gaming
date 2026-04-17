MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
1. Search engine paths for sample-specific references.
2. Extract/move logic to samples or adapters.
3. Ensure engine remains generic.
4. Run:
   node ./scripts/run-node-tests.mjs
   npm test
5. Package:
   <project folder>/tmp/BUILD_PR_LEVEL_18_2_REMOVE_SAMPLE_LOGIC_FROM_ENGINE.zip

CONSTRAINTS:
- Smallest scoped change
- Do not modify unrelated systems
