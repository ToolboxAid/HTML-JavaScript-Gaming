MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_01_COMBINED_STRUCTURE_CLOSEOUT` as a combined section-1 closeout PR.

Goal:
Finish as much of roadmap section 1 as truthfully possible in one PR to reduce follow-on PR count.

Required work:
1. Validate the current state of roadmap section 1 against the actual repo.
2. Close all section-1 items that are already supported by repo reality.
3. If a small number of remaining structure issues block closure:
   - fix only the smallest surgical items needed
   - avoid broad folder churn
   - avoid unrelated scope
4. Confirm and document current structure boundaries for:
   - src/engine
   - src/shared
   - games
   - games/_template
   - samples
   - tools
   - tools/shared
5. Update roadmap status markers only.
   - do NOT rewrite roadmap text
6. If section 1 still cannot be fully closed:
   - leave only the truly incomplete items open
   - report exact blockers

Final packaging step is REQUIRED:
`<project folder>/tmp/BUILD_PR_LEVEL_01_COMBINED_STRUCTURE_CLOSEOUT.zip`

Hard rules:
- reduce PR count by combining the remaining section-1 work here
- keep fixes surgical
- no unrelated repo changes
- no missing ZIP
