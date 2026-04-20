MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_06_TOOL_SHELL_FOUNDATION_AND_FIRST_TOOL_MIGRATION as one focused, testable PR.

Rules:
- one PR purpose only
- use the new shared theme direction
- no legacy styling as the baseline
- no embedded <style> in HTML
- no inline style=""
- no JS-generated styling
- keep theme under src/engine/theme
- migrate one tool only

Required work:
1. Add shared tool-shell styling under src/engine/theme.
2. Establish a full-width tool page layout:
   - fixed left rail
   - flexible center
   - fixed right rail
3. Migrate one tool page to use the shared shell.
4. Keep the migrated tool visually testable and functional.
5. Update MASTER_ROADMAP_STYLE.md by ADDING a STYLE_06 test section only.
   - do not delete existing text
   - do not rewrite existing text
6. Package to:
   <project folder>/tmp/BUILD_PR_STYLE_06_TOOL_SHELL_FOUNDATION_AND_FIRST_TOOL_MIGRATION.zip
