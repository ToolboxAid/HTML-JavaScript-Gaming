MODEL: GPT-5.3-codex
REASONING: high

Execute BUILD_PR_LEVEL_18_4_GAME_TO_SAMPLE_RECLASSIFICATION_EXECUTION.

Required behavior:
1. Use the prior reviewed recommendations as the source of truth.
2. Execute only the approved reclassification moves for:
   - games/Bouncing-ball
   - games/Gravity
   - games/Thruster
   - games/ProjectileLab
   - games/Orbit
   - games/PaddleIntercept
   - games/MultiBallChaos
3. Do not change games/PacmanLite.
4. Apply only the exact path/reference updates needed to keep the moved entries valid.
5. Do not expand into unrelated cleanup or refactors.
6. Write execution-backed reports to docs/dev/reports.
7. Update docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md in place under these rules:
   - never delete roadmap content
   - never rewrite roadmap text
   - only update status markers:
     - [ ] -> [.]
     - [.] -> [x]
   - append additive content only if explicitly required by this PR

Packaging:
- produce final ZIP at:
  <project folder>/tmp/BUILD_PR_LEVEL_18_4_GAME_TO_SAMPLE_RECLASSIFICATION_EXECUTION.zip
