MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_09_TOOL_HEIGHT_AND_VIEWPORT_FIT as one focused, testable PR.

Rules:
- one PR purpose only
- refine the existing shared tool shell only
- no legacy styling as the baseline
- keep CSS Grid for the primary shell
- preserve STYLE_08 adaptive density improvements
- no embedded <style> in HTML
- no inline style=""
- no JS-generated styling
- keep theme under src/engine/theme
- do NOT create or leave staging folders in <project folder>/tmp/
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_09_TOOL_HEIGHT_AND_VIEWPORT_FIT.zip

Roadmap rule:
- Codex updates MASTER_ROADMAP_STYLE.md during execution only
- append STYLE_09 checklist/results only
- do not delete existing text
- do not rewrite existing text
- update completion markers only if execution-backed

Required work:
1. Refine the shared tool-shell CSS for better viewport-height fit.
2. Reduce page-level vertical scrolling where practical.
3. Localize scrolling to panels/readouts where needed.
4. Preserve the shared shell structure and adaptive density work from STYLE_08.
5. Validate against the current migrated shell tools.
6. Package only the final zip to the project tmp path above.
