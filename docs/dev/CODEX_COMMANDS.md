MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_6_4_SAMPLE_RUNTIME_VALIDATION.

Scope:
- samples runtime only

Steps:
1. Load each sample.
2. Verify no runtime errors.
3. Confirm render loop executes.
4. Confirm no blocking console errors.
5. Fix only path/runtime issues if required (no refactors).

Validation:
- all samples run
- no crashes
- navigation intact

Output:
<project folder>/tmp/BUILD_PR_LEVEL_6_4_SAMPLE_RUNTIME_VALIDATION.zip
