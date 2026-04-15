MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_03_SHARED_FOUNDATION_COMBINED_PASS` as one combined Section-3 PR.

Goal:
Finish as much of Shared Foundation (`src/shared`) as truthfully possible in one pass.

Target items to close in this PR if supported:
- arrays utilities consolidated
- strings utilities consolidated
- ids utilities consolidated
- shared math layer consolidated
- shared state guards consolidated
- shared state normalization consolidated
- shared selectors consolidated
- shared contracts consolidated
- shared io/data/types stabilized

Required work:
1. Treat the utility cluster as one lane:
   - arrays
   - strings
   - ids
   - shared math

2. Treat the shared-state cluster as one lane:
   - state guards
   - state normalization
   - selectors
   - contracts

3. Stabilize shared io/data/types enough to support and close as much of the above as possible.

4. Reuse existing exact-cluster extraction patterns already established in the repo.

5. Close as many Section-3 items as truthfully possible in this one PR.

6. If anything remains open:
   - keep the residue very small
   - report exact blockers
   - leave it suitable for one residue-only PR

Roadmap:
- update status markers only
- do NOT rewrite roadmap text

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_03_SHARED_FOUNDATION_COMBINED_PASS.zip`

Hard rules:
- combine aggressively to reduce PR count
- keep the changes coherent
- no unrelated repo changes
- no missing ZIP
