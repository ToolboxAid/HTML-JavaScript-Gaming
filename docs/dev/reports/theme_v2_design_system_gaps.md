# Theme V2 Design System Gaps

PR: `PR_26152_032-theme-v2-direct-primitives`

## Direct Theme V2 Primitives Added

These primitives were authored directly in Theme V2 using existing Theme V2 tokens. They do not use V1/legacy CSS as a source, target, or comparison baseline.

| Primitive area | Owning file | New selectors | Intended consumers |
| --- | --- | --- | --- |
| Page/content layout | `layout.css` | `.content-stack`, `.content-stack--compact`, `.content-cluster`, `.content-grid`, `.content-grid--three`, `.content-split` | Migrated Theme V2 pages that need reusable content stacking, clustering, two/three-column grids, or split content layouts. |
| Panel/card surfaces | `panels.css` | `.surface`, `.surface-header`, `.surface-body`, `.surface-footer`, `.card-header`, `.card-footer`, `.card-media`, `.card-media img` | Migrated Theme V2 pages that need reusable framed content, card sections, or media areas. |
| Buttons/actions | `buttons.css` | `.btn:disabled`, `.btn[aria-disabled=true]`, `.btn:focus-visible`, `.action-group`, `.action-group--end` | Migrated Theme V2 pages that need consistent action grouping, disabled affordance, and focus affordance. |
| Forms/inputs | `forms.css` | `.field-group`, `.field-row`, `.field-hint` | Migrated Theme V2 pages that need reusable label/input grouping, responsive paired fields, and helper text. |
| Accordions | `accordion.css` | `.accordion-group` | Migrated Theme V2 pages that need reusable spacing between existing `details.vertical-accordion` blocks. |
| Status/log surfaces | `status.css` | `.feedback`, `.feedback-title`, `.feedback-message`, `.event-log`, `.event-log-entry` | Migrated Theme V2 pages that need reusable message panels or structured textual logs. |
| Tables | `tables.css` | `.data-table`, `.data-table caption`, `.data-table th` | Migrated Theme V2 pages that need reusable data table presentation beyond the generic table baseline. |

## Remaining Gaps

| Gap | Reason Deferred |
| --- | --- |
| Tool-shell layout, tool columns, tool display mode, and focus behavior are still unresolved. | Tool-specific primitives are out of scope for this PR. They require separate approval and direct Theme V2 design. |
| Horizontal tool-panel accordion toggles are still unresolved. | This PR adds only generic accordion grouping; tool-specific toggles require separate approval. |
| Dialog/modals are still unresolved. | Dialog primitives were not requested in this PR and require separate approval. |
| Brand/background/meaning utility systems are still unresolved. | New color utility systems were not requested in this PR and require separate approval. |
| Badge/pill/role metadata variants are still unresolved. | This PR adds generic feedback/log primitives only; metadata variants require separate approval. |

## Guardrails

- Do not use V1/legacy CSS as the source for any future replacement.
- Do not compare new Theme V2 work to V1/legacy CSS as the desired target.
- Do not restore removed selectors through aliases, wrapper selectors, duplicate compatibility classes, or fallback imports.
- Not-yet-migrated page families may continue to retain their existing legacy references until their own migration PR, but migrated Theme V2 pages must not depend on V1/legacy CSS.
