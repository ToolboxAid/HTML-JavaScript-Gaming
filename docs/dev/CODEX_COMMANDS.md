MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_01_FINAL_RESIDUE_ONLY` as the final residue-only PR for roadmap section 1.

Only close these remaining items:
- implementation PRs executed
- src/engine/rendering
- src/engine/physics
- src/engine/scene

Required work:
1. Make the smallest valid repo changes needed to truthfully close those four items.
2. Ensure imports/paths remain valid.
3. Ensure validation remains green.
4. Update roadmap status markers only.
5. Do NOT expand into section 2 or unrelated structure work.
6. Do NOT reopen or rework already-complete section-1 items.

Success target:
- section 1 becomes fully complete after this PR.

Final packaging step is REQUIRED:
`<project folder>/tmp/BUILD_PR_LEVEL_01_FINAL_RESIDUE_ONLY.zip`

Hard rules:
- residue-only closeout
- smallest valid change set
- no unrelated repo changes
- no missing ZIP
