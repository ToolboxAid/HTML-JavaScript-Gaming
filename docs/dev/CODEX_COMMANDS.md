MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_09_TOOLS_RESIDUE_ONLY` as the final residue-only PR for the Tools lane.

Goal:
Close only the remaining residue left after:
`BUILD_PR_LEVEL_09_TOOLS_NORMALIZATION_AND_REQUIRED_TOOLS_COMBINED_PASS`

Required work:
1. Inspect the results of the prior combined tools pass.
2. Identify only the tool items that still remain open.
3. Make the smallest valid changes needed to close those remaining items.
4. Do NOT reopen or rework tool items already completed.
5. Do NOT expand scope beyond the actual residue.
6. Update roadmap status markers only.
7. Report whether the Tools lane is now fully complete.

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_09_TOOLS_RESIDUE_ONLY.zip`

Hard rules:
- residue-only closeout
- no unrelated repo changes
- no missing ZIP
