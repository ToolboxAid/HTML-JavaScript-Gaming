MODEL: GPT-5.4
REASONING: medium

COMMAND:
Create BUILD_PR_LEVEL_19_6_OVERLAY_MULTI_LAYER_COMPOSITION as the next smallest executable/testable PR.

Requirements:
- Add multi-layer overlay composition for gameplay-safe overlays
- Define and enforce deterministic render ordering for multiple active overlays
- Prevent overlap/occlusion regressions in the composed state
- Preserve existing shared non-Tab input mapping
- Preserve gameplay-first input priority
- Add or update focused tests validating composition order and non-interference
- Update roadmap status for this PR using status markers only ([ ] [.] [x]); do not rewrite roadmap text
- Do not modify start_of_day folders
- Package the repo-structured ZIP to <project folder>/tmp/BUILD_PR_LEVEL_19_6_OVERLAY_MULTI_LAYER_COMPOSITION.zip
