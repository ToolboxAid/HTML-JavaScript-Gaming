MODEL: GPT-5.4
REASONING: medium

COMMAND:
Create BUILD_PR_LEVEL_19_3_OVERLAY_INTERACTION_CONTROLS as the next smallest executable/testable PR.

Requirements:
- Add gameplay-safe interaction controls for overlays introduced by Level 19.2
- Support show/hide and cycle behavior in gameplay runtime
- Reuse the shared overlay/input mapping; do not reintroduce hardcoded Tab behavior
- Preserve existing debug overlay behavior
- Add or update focused tests proving overlay controls do not interfere with gameplay controls
- Keep scope narrow and testable
- Do not modify start_of_day folders
- Package the repo-structured ZIP to <project folder>/tmp/BUILD_PR_LEVEL_19_3_OVERLAY_INTERACTION_CONTROLS.zip
