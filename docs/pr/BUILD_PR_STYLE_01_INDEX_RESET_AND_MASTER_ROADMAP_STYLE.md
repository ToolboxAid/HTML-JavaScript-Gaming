# BUILD_PR_STYLE_01_INDEX_RESET_AND_MASTER_ROADMAP_STYLE

## Purpose
Create the style roadmap and execute the first real, testable style migration: reset `/index.html` onto the new Toolbox Aid-derived shared theme.

## Single PR Purpose
Reset `/index.html` to the new shared style foundation without carrying forward existing project-local styling.

## Must Use as Source
- Toolbox Aid live site structure and CSS behavior as the baseline.
- Do not inspect existing HTML-JavaScript-Gaming CSS/HTML to preserve old styles.

## Required Deliverables
1. Add `docs/dev/roadmaps/MASTER_ROADMAP_STYLE.md`.
2. Add `src/engine/theme/main.css` as the new shared foundation.
3. Add `src/engine/theme/toolboxaid-header.html` using Toolbox Aid header source with only these content changes:
   - tagline = `HTML-JavaScript Gaming`
   - menu = Home / Games / Samples / Tools
4. Add any other theme CSS files needed for a clean separation.
5. Reset `/index.html` to use the new theme and shared header.
6. Remove embedded styling from `/index.html`.
7. Avoid JS-driven styling.
8. Keep HTML-page JS minimal.

## Styling Targets for `/index.html`
- shared Toolbox Aid-derived header
- shared page intro/title area
- consistent spacing and margin rules
- no dependence on old project selectors unless intentionally reintroduced
- no inline style
- no `<style>` block
- no JS style strings

## Acceptance
- `/index.html` is visually testable
- `/index.html` uses only the new shared theme path
- header is loaded from shared source
- existing project-local styling is not preserved as a dependency
- roadmap is added and exhaustive enough to track the remaining migration
