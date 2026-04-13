MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_6_2_SAMPLE_CURRICULUM_VALIDATION.

Scope:
- samples/ and samples/index.html only

Steps:
1. Analyze sample ordering by phase/number.
2. Ensure each sample has one clear primary concept.
3. Identify overlaps and resolve by reordering or flagging (no deletes unless exact duplicates).
4. Update samples/index.html if ordering changes.

Validation:
- clean progression
- no overlapping adjacent concepts
- navigation intact

Output:
<project folder>/tmp/BUILD_PR_LEVEL_6_2_SAMPLE_CURRICULUM_VALIDATION.zip
