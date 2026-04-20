MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Implement BUILD_PR_HEADER_INTRO_OVERLAY_COLLAPSED_HEADER_RESTYLE as one narrow style PR.

Requirements:
- Move the shared Header and Intro visual block on top of the hero image
- No background behind the overlaid Header and Intro block
- Overlay foreground color: #ed9700
- Collapsed header background color: #7a00df
- Remove corner rounding from the header container
- Exclude page-shell from this PR; do not modify page-shell selectors/rules

Constraints:
- shared theme CSS only where possible under src/engine/theme/
- no embedded <style>
- no inline style=
- no JS style string injection
- no repo-wide cleanup
- smallest scoped valid change
- preserve existing collapse behavior

Validation:
- targeted shared entry pages show overlay correctly
- collapsed state shows #7a00df background
- header border radius removed
- no page-shell changes
- no regressions / no console errors

Roadmap:
- update roadmap status only if there is an existing matching item for this work
- do not rewrite roadmap text
- status-only transition backed by the implemented/tested change

Package output to:
<project folder>/tmp/BUILD_PR_HEADER_INTRO_OVERLAY_COLLAPSED_HEADER_RESTYLE.zip
