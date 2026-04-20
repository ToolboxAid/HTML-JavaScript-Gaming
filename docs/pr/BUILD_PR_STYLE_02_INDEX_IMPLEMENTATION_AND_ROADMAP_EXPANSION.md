# BUILD_PR_STYLE_02_INDEX_IMPLEMENTATION_AND_ROADMAP_EXPANSION

## Purpose
Expand the style roadmap so no important style-system requirements are lost, and execute the next real testable slice: implement the `/index.html` migration on the new Toolbox Aid-derived theme base.

## Single PR Purpose
Implement `/index.html` on the new shared style system and record the expanded roadmap requirements.

## Required Deliverables
1. Update `docs/dev/roadmaps/MASTER_ROADMAP_STYLE.md` with the bundled additive expansions only.
2. Add the new theme foundation files under `src/engine/theme/`.
3. Add `src/engine/theme/toolboxaid-header.html` sourced from Toolbox Aid with only the approved content changes:
   - tagline = `HTML-JavaScript Gaming`
   - menu = Home / Games / Samples / Tools
4. Extract the minimum required CSS for the header to render correctly without relying on legacy project CSS.
5. Reset `/index.html` to use the new theme only.
6. Remove any embedded styling from `/index.html`.
7. Keep plain-page JS minimal.

## Must Not Do
- do not inspect or preserve old project CSS/HTML as the styling baseline
- do not migrate `/samples/index.html`, `/games/index.html`, or `/tools/index.html` in this PR
- do not add inline style or JS-generated styling
- do not turn `main.css` into a dumping ground

## Acceptance
- roadmap gains the additive tracking items from this bundle
- `/index.html` becomes a clean testable implementation slice
- `/index.html` depends only on the new theme path
- header renders from shared source
- no embedded styling remains on `/index.html`
