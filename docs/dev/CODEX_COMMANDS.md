MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_04_STATE_REPLAY_TIMELINE_COMBINED_PASS` as one combined Section-4 PR.

Goal:
Finish as much of State, Replay, Timeline, and Authoritative Flow as truthfully possible in one pass.

Target items to close in this PR if supported:
- replay/timeline boundaries normalized
- state contracts extracted/confirmed
- replay model
- timeline orchestration
- authoritative state slices

Required work:
1. Treat the remaining open Section-4 items as one coherent state-flow lane.
2. Complete/confirm the state contracts needed to support replay and timeline work.
3. Normalize replay model and timeline orchestration together.
4. Normalize replay/timeline boundaries as part of that same pass.
5. Close any remaining authoritative-state-slice residue truthfully without reopening already-stable work.
6. Reuse the already-established authoritative/passive, promotion-gate, selector, and rollback work instead of redoing it.
7. Close as many Section-4 items as truthfully possible in this one PR.
8. If anything remains open:
   - keep the residue very small
   - report exact blockers
   - leave it suitable for one residue-only PR

Roadmap:
- update status markers only
- do NOT rewrite roadmap text

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_04_STATE_REPLAY_TIMELINE_COMBINED_PASS.zip`

Hard rules:
- combine aggressively to reduce PR count
- keep the changes coherent
- no unrelated repo changes
- no missing ZIP
