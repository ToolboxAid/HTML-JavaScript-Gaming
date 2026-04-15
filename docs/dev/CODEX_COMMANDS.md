MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_02_2D_CAPABILITY_COMBINED_FOUNDATION` as one combined 2D capability PR.

Goal:
Finish the 2D Engine Capability cluster in the fewest practical PRs.

Target items to close in this PR if truthfully possible:
- 2D scene boot
- 2D render loop
- 2D camera
- 2D tilemap integration
- 2D collision patterns
- 2D gameplay hooks

Required work:
1. Treat these as one coherent 2D engine slice, not six isolated tasks.
2. Bundle the work logically:
   - scene boot + render loop + gameplay hooks
   - camera + tilemap integration
   - collision patterns + gameplay hooks
3. Reuse existing validated repo patterns where possible.
4. Keep the implementation engine-facing and reusable.
5. Avoid game-specific hacks unless they are already the accepted engine pattern.
6. Close as many of the six items as truthfully possible in this one PR.
7. If anything remains open:
   - keep the residue very small
   - report exact blockers
   - leave it suitable for one residue-only PR

Roadmap:
- update status markers only
- do NOT rewrite roadmap text

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_02_2D_CAPABILITY_COMBINED_FOUNDATION.zip`

Hard rules:
- combine aggressively to reduce PR count
- coherent implementation over scattered edits
- no unrelated repo changes
- no missing ZIP
