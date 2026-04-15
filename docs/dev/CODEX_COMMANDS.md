MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_12_2D_CAPABILITY_TRACK_COMBINED_CLOSEOUT` as one combined 2D Capability Track PR.

Goal:
Finish as much of the 2D Capability Track as truthfully possible in one pass.

Target items to close in this PR if supported:
- camera systems stabilized
- tilemap/runtime integration stabilized
- collision patterns stabilized
- enemy/hero/gameplay conventions stabilized
- replay/state integration for 2D games stabilized
- polished 2D reference game path established
- 2D reference game built

Required work:
1. Treat the core 2D runtime items as one gameplay-runtime cluster:
   - camera
   - tilemap/runtime
   - collision patterns
   - enemy/hero/gameplay conventions

2. Treat replay/state integration as part of that same 2D runtime lane, reusing the already-established Section-4 state/replay/timeline foundations.

3. Use this PR to establish and, if truthfully supported, complete the 2D reference game path and 2D reference game build.
   - If the full build cannot be truthfully completed, establish the exact path and leave only the smallest explicit residue.

4. Reuse existing repo patterns and already-completed lanes instead of introducing disconnected one-offs.

5. Close as many target items as truthfully possible in this one PR.

6. If anything remains open:
   - keep the residue very small
   - report exact blockers
   - leave it suitable for one residue-only PR

Roadmap:
- update status markers only
- do NOT rewrite roadmap text

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_12_2D_CAPABILITY_TRACK_COMBINED_CLOSEOUT.zip`

Hard rules:
- combine aggressively to reduce PR count
- keep the changes coherent
- no unrelated repo changes
- no missing ZIP
