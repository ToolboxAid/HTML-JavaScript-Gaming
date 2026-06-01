# Theme V2 Design System Gaps

PR: `PR_26152_034-theme-v2-admin-copy-correction`

## Admin Copy Correction Result

No new Theme V2 CSS gaps were discovered while validating the named Admin pages against the approved working Theme V2 HTML structure.

Admin pages validated successfully with the existing Theme V2 primitives:

- Page layout: `.page-title`, `.section`, `.container`, `.account-panel`, `.admin-page-stack`, `.grid`
- Navigation/panels: `.side-menu`, `.card`, `.card-body`, `.callout`, `.mini-stat`
- Controls: `.controls-hero`, `.controls-hero-grid`, `.control-section`, `.control-lab`, `.control-card`, `.control-demo`, `.control-row`, `.choice`, `.switch`
- Tables: `.table-wrapper`, `.data-table`
- Accordions: `.vertical-accordion`, `.accordion-body`
- Brand/color references: `.brand-color-code`, `.brand-color-swatch`, swatch classes, side accent classes, tool-group classes

## Class And ID Correction Result

| Check | Result |
| --- | --- |
| Admin class changes required for PR034 | None. |
| Admin ID changes required for PR034 | None. |
| New selectors required | None. |
| CSS changes required | None. |
| Pages unable to match approved Theme V2 structure | None. |

## Approved Structure Confirmed

The named Admin pages already match the approved Theme V2 Admin structure without additional CSS:

- Shared partial slots.
- `theme/v2/theme.css` stylesheet consumption.
- `.page-title` or `.controls-hero` page header.
- `.section > .container.account-panel` Admin layout.
- `aside.side-menu[aria-label="Admin pages"]` Admin navigation.
- `.admin-page-stack` content column.
- Direct child `.section` or `.control-section` blocks with direct `.container` wrappers.

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
