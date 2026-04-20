MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_08_ADAPTIVE_TOOL_DENSITY as one focused, testable PR.

Rules:
- one PR purpose only
- refine the existing shared tool shell only
- no legacy styling as the baseline
- keep CSS Grid for the primary shell
- no embedded <style> in HTML
- no inline style=""
- no JS-generated styling
- keep theme under src/engine/theme
- do not redesign tools

Required work:
1. Refine the shared tool-shell CSS to improve density.
2. Replace fixed left/right rail widths with responsive clamp() sizing where appropriate.
3. Reduce shell/panel spacing where safe and align to the shared spacing system.
4. Avoid horizontal scrolling at normal desktop widths.
5. Reduce vertical scrolling where practical.
6. Apply and validate the refined shell against the tools already migrated to the shared shell.
7. Update MASTER_ROADMAP_STYLE.md:
   - append STYLE_08 checklist only
   - do not delete existing text
   - do not rewrite existing text
   - update completion markers only if execution-backed
8. Package to:
   <project folder>/tmp/BUILD_PR_STYLE_08_ADAPTIVE_TOOL_DENSITY.zip
