MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
1. Open:
   tests/samples/SamplesProgramCombinedPass.test.mjs

2. Locate phase expectation assertion.

3. Replace hardcoded phase list:
   phase-01 → phase-15

4. Update to:
   include phase-16, phase-17, phase-18, phase-19

   Preferred:
   derive phases dynamically from filesystem OR
   extend static list to 19

5. Run:
   node ./scripts/run-node-tests.mjs

6. Confirm:
   SamplesProgramCombinedPass passes

7. Package ZIP:
   <project folder>/tmp/BUILD_PR_LEVEL_19_7_FIX_SAMPLE_PHASE_EXPECTATION.zip

CONSTRAINTS:
- Do not modify unrelated tests
- Do not change engine/runtime code
- Smallest scoped change only
