MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_16_PHASE_DESCRIPTIONS_REPO_WIDE_NORMALIZATION`.

Goal:
Close the final remaining item:
- phase descriptions normalized repo-wide

Required work:
1. Find repo locations where phase descriptions are defined or repeated.
2. Normalize them so they are consistent with the current roadmap, numbering, and phase structure.
3. Touch only phase-description text and directly related references.
4. Do not expand scope into unrelated documentation cleanup.
5. Update roadmap status markers only.
6. Report whether the item can now be truthfully marked complete.

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_16_PHASE_DESCRIPTIONS_REPO_WIDE_NORMALIZATION.zip`

Hard rules:
- smallest valid closeout
- no unrelated repo changes
- no missing ZIP
