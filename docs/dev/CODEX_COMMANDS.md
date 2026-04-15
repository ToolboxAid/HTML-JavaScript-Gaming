MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_03_EXACT_CLUSTER_NUMBER_STRING_ID_CLOSEOUT`.

Goal:
Close the final remaining Shared Foundation checkpoint item:
- remaining number/string/id helpers still need exact-cluster normalization

Required work:
1. Find the remaining duplicated or fragmented helper clusters in:
   - number
   - string
   - id
2. Normalize them using exact-cluster extraction only.
3. Move them into the correct `src/shared` homes.
4. Update consumers as needed.
5. Do NOT perform a broad repo-wide cleanup pass.
6. Do NOT do blind dedupe.
7. Update roadmap status markers only.
8. Report whether the item can now be truthfully marked complete.

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_03_EXACT_CLUSTER_NUMBER_STRING_ID_CLOSEOUT.zip`

Hard rules:
- exact-cluster work only
- no unrelated repo changes
- no missing ZIP
