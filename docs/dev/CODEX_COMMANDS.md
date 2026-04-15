MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_06_SAMPLES_PROGRAM_COMBINED_PASS` as one combined Section-6 PR.

Goal:
Finish as much of the Samples Program lane as truthfully possible in one pass.

Target items to close in this PR if supported:
- phase grouping normalized
- `samples/shared` boundaries defined and used
- sample-to-engine dependency cleanup completed
- sample curriculum progression validated

Required work:
1. Treat the remaining open Section-6 items as one coherent lane.
2. Complete phase grouping normalization where still incomplete.
3. Define and apply `samples/shared` boundaries:
   - what belongs in `samples/shared`
   - what stays sample-owned
   - what must not leak into engine/shared incorrectly
4. Clean up sample-to-engine dependencies truthfully and surgically.
5. Validate curriculum progression after grouping/boundary cleanup.
6. Reuse established numbering/formatting/index work instead of redoing it.
7. Close as many Section-6 items as truthfully possible in this one PR.
8. If anything remains open:
   - keep the residue very small
   - report exact blockers
   - leave it suitable for one residue-only PR

Roadmap:
- update status markers only
- do NOT rewrite roadmap text

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_06_SAMPLES_PROGRAM_COMBINED_PASS.zip`

Hard rules:
- combine aggressively to reduce PR count
- keep the changes coherent
- no unrelated repo changes
- no missing ZIP
