MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_02_INDEX_IMPLEMENTATION_AND_ROADMAP_EXPANSION as one focused, testable PR.

Rules:
- one PR purpose only
- add to MASTER_ROADMAP_STYLE only; do not remove roadmap items
- no big-bang migration
- do not use existing HTML-JavaScript-Gaming styling as the base
- derive the new style baseline from Toolbox Aid
- no embedded <style> in HTML
- no inline style=""
- no JS-generated styling
- theme stays under src/engine/theme
- keep HTML-page JS minimal

Required work:
1. Update docs/dev/roadmaps/MASTER_ROADMAP_STYLE.md with the bundled additive items.
2. Create the theme foundation files under src/engine/theme:
   - main.css
   - header.css
   - nav.css
   - layout.css
   - pages.css
   - any additional theme file only if justified
3. Pull the Toolbox Aid header into src/engine/theme/toolboxaid-header.html with only:
   - tagline changed to HTML-JavaScript Gaming
   - menu changed to Home / Games / Samples / Tools
4. Extract the minimum required CSS so the header renders correctly without legacy dependencies.
5. Reset /index.html onto the new theme and shared header.
6. Remove old embedded/page-local styling dependencies from /index.html.
7. Keep the implementation surgical and testable.
8. Package to:
   <project folder>/tmp/BUILD_PR_STYLE_02_INDEX_IMPLEMENTATION_AND_ROADMAP_EXPANSION.zip
