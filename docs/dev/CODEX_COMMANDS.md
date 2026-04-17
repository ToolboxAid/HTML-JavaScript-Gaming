MODEL: GPT-5.3-codex
REASONING: high

Execute BUILD_PR_LEVEL_18_3_GAME_TO_SAMPLE_RECLASSIFICATION_RECOMMENDATIONS.

Primary task:
- inspect and classify these entries:
  - games/Bouncing-ball
  - games/Gravity
  - games/Thruster
  - games/ProjectileLab
  - games/Orbit
  - games/PaddleIntercept
  - games/MultiBallChaos
  - games/PacmanLite

Required output:
1. Determine for each entry:
   - remain in games
   - or recommend move to samples
2. For each sample/demo recommendation, assign the best-fit `phase-xx` move target.
3. Write the classification matrix and rationale to docs/dev/reports.

Roadmap requirement for this bundle:
- update docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md in place
- preserve all existing roadmap text
- never delete roadmap content
- never rewrite existing roadmap text
- only update status markers using:
  - [ ] -> [.]
  - [.] -> [x]
- append additive roadmap content only if explicitly required by this PR

Constraints:
- no broad repo cleanup
- no unrelated refactors
- keep scope tightly limited to classification + roadmap update
- package final ZIP to:
  <project folder>/tmp/BUILD_PR_LEVEL_18_3_GAME_TO_SAMPLE_RECLASSIFICATION_RECOMMENDATIONS.zip
