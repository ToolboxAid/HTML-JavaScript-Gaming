# Theme V2 Design System Gaps

PR: `PR_26152_033-theme-v2-admin-consumption`

## Admin Consumption Result

No new Theme V2 CSS gaps were discovered while migrating the named Admin pages to consume existing Theme V2 CSS.

Admin pages validated successfully with the existing Theme V2 primitives:

- Page layout: `.page-title`, `.section`, `.container`, `.account-panel`, `.admin-page-stack`, `.grid`
- Navigation/panels: `.side-menu`, `.card`, `.card-body`, `.callout`, `.mini-stat`
- Controls: `.controls-hero`, `.controls-hero-grid`, `.control-section`, `.control-lab`, `.control-card`, `.control-demo`, `.control-row`, `.choice`, `.switch`
- Tables: `.table-wrapper`, `.data-table`
- Accordions: `.vertical-accordion`, `.accordion-body`
- Brand/color references: `.brand-color-code`, `.brand-color-swatch`, swatch classes, side accent classes, tool-group classes

## Resolved In This PR

| Gap | Resolution |
| --- | --- |
| Admin `branding.html` carried non-owned/dead classes for mascot cards and feature images. | Removed the dead classes and relied on existing Theme V2 `.card` and `.card img` styling. |
| Admin `controls.html` carried non-owned/dead `controls-title` and `control-row--choice` classes. | Removed the dead classes and relied on existing Theme V2 heading and `.control-row` / `.choice` styling. |
| Admin `design-system.html` still described legacy CSS ownership files. | Updated copy to describe Theme V2 ownership files. |
| Admin `grouping-colors.html` table did not consume the available Theme V2 data table primitive. | Added existing `.data-table` to the table. |
| Admin `grouping-colors.html` copy still referenced legacy grouping CSS import ownership. | Updated copy to reference Theme V2 group classes and `theme/v2/colors.css`. |

## Remaining Gaps Outside This PR

| Gap | Reason Deferred |
| --- | --- |
| Dialog/modal primitives remain unresolved. | No Admin page in this PR required dialog styling. |
| Tool-shell layout, tool columns, display mode, and focus behavior remain unresolved. | Tool pages are explicitly out of scope. |
| Horizontal tool-panel accordion toggles remain unresolved. | Tool pages are explicitly out of scope. |
| Badge/pill/role metadata variants remain unresolved. | Admin pages in this PR did not require them. |

## Guardrails

- Do not use V1/legacy CSS as the source for any future replacement.
- Do not compare new Theme V2 work to V1/legacy CSS as the desired target.
- Do not restore removed selectors through aliases, wrapper selectors, duplicate compatibility classes, or fallback imports.
- Not-yet-migrated page families may continue to retain their existing legacy references until their own migration PR, but migrated Theme V2 pages must not depend on V1/legacy CSS.
