MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_6_3_SAMPLE_SHARED_BOUNDARIES.

Scope:
- samples/ only

Steps:
1. Scan samples for reusable utilities.
2. Mark (comment or report) candidates for shared extraction.
3. Ensure sample-only logic stays local.
4. Remove any direct dependency on non-public engine internals (adjust imports if needed without refactor).

Validation:
- samples run
- no engine changes
- no boundary violations

Output:
<project folder>/tmp/BUILD_PR_LEVEL_6_3_SAMPLE_SHARED_BOUNDARIES.zip
