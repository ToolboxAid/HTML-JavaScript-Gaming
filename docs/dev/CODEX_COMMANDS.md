MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_07_NETWORK_DEBUG_AND_SERVER_DASHBOARD_COMBINED_CLOSEOUT` as one combined network-debug and server-dashboard closeout PR.

Goal:
Finish as much of the remaining network debug / readiness / dashboard lane as truthfully possible in one pass.

Target items to close in this PR if supported:

Track Q:
- Latency / RTT panel
- Replication state viewer

Track R:
- network.help
- network.replication
- network.sample.*

Track S:
- Sample-backed provider validation
- Sample-backed panel validation
- Operator command validation
- Debug-only gating validation
- Promotion recommendation

Track T:
- Server dashboard shell
- Player statistics view
- Latency view
- RX bytes view
- TX bytes view
- Connection/session counts
- Per-player status rows
- Refresh/update strategy
- Debug-only access rules

Required work:
1. Treat the remaining open items as one coherent network-observability lane.
2. Complete the remaining debug panels/commands.
3. Bundle the readiness-to-promote validations together.
4. Build the dashboard as one shell-plus-views slice.
5. Reuse existing connection/divergence/trace/status/latency work instead of redoing it.
6. Close as many remaining items as truthfully possible in this one PR.
7. If anything remains open:
   - keep the residue very small
   - report exact blockers
   - leave it suitable for one residue-only PR

Roadmap:
- update status markers only
- do NOT rewrite roadmap text

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_07_NETWORK_DEBUG_AND_SERVER_DASHBOARD_COMBINED_CLOSEOUT.zip`

Hard rules:
- combine aggressively to reduce PR count
- keep the changes coherent
- no unrelated repo changes
- no missing ZIP
