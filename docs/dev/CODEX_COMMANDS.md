MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOLS_THEME_REUSE_BASELINE as a docs-to-code follow-up to PLAN_PR_TOOLS_SHARED_NORMALIZATION.

Scope:
- prioritize reuse of existing engine theme/UI assets before adding or expanding any new tool-local CSS
- target active tools only:
  - tools/Asset Browser
  - tools/Palette Browser
  - tools/Parallax Scene Studio
  - tools/Sprite Editor
  - tools/Tilemap Studio
  - tools/Vector Asset Studio
  - tools/Vector Map Editor
- preserve tools/SpriteEditor_old_keep
- keep scope tight to shell/theme/layout normalization and import alignment only
- do not refactor tool-specific behavior
- do not rewrite roadmap wording
- do not touch start_of_day directories

Validation:
- each touched tool loads
- no console regressions
- no shell/theme visual collapse
- report exact files changed

Output:
- package repo-structured delta ZIP under <project folder>/tmp/
- use docs/dev/reports for validation/report files
