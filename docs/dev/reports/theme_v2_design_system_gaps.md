# Theme V2 Design System Gaps

PR: `PR_26152_031-remove-bad-v2-css-migration`

## Removed Migration-Invalid CSS

The following Theme V2 CSS was removed because the prior audit classified it as moved, copied, mirrored, or propagated from V1/legacy styling rather than authored directly as approved reusable Theme V2 design-system styling.

| Removed area | Removed from | Current status |
| --- | --- | --- |
| Horizontal accordion toggles and tool-column accordion overrides | `accordion.css` | Design-system gap. Requires approval and direct Theme V2 design before reimplementation. |
| Tool display mode summary arrows | `accordion.css` | Design-system gap. Requires approval and direct Theme V2 design before reimplementation. |
| Meaning color utilities, brand background utilities, extra side accents, and tool-column header color variants | `colors.css` | Design-system gap. Requires approval before adding any new Theme V2 utility or color system. |
| Button row helpers, inline row helpers, button hover/disabled normalization, and return-to-top meaning-variable hooks | `buttons.css` | Design-system gap. Requires approval and direct Theme V2 design before reimplementation. |
| Dialog baseline and dialog sample styling | `dialogs.css` | Design-system gap. Requires approval and direct Theme V2 design before reimplementation. |
| Form row, field stack, and control fieldset helpers | `forms.css` | Design-system gap. Requires approval and direct Theme V2 design before reimplementation. |
| Tool workspace, tool grid, tool display layout, and focus-mode layout system | `layout.css` | Design-system gap. Requires approval and direct Theme V2 design before reimplementation. |
| Tool cards, tool columns, tool center panel, tool display body, and tool-card image sizing | `panels.css` | Design-system gap. Requires approval and direct Theme V2 design before reimplementation. |
| Tool-shell size, focus, dialog, card image, and grid tokens | `spacing.css` | Design-system gap. Requires approval before adding any new Theme V2 layout token system. |
| Status, log, pill, role, tool-group label, and tool-group swatch styling | `status.css` | Design-system gap. Requires approval and direct Theme V2 design before reimplementation. |
| `.table` class styling | `tables.css` | Design-system gap. Generic table baseline remains; class-specific table styling requires approval before reimplementation. |

## Preserved Theme V2 Styling

The removal preserved already-approved Theme V2 files and rules that existed before the invalid foundation migration, including:

- Theme V2 import ownership through `theme.css`.
- Base color tokens and existing approved Theme V2 color/group classes.
- Base spacing, typography, layout, panel, form, control, accordion, table, button, dialog, and status files.
- Existing generic table baseline including `.table-wrapper`, `table`, `caption`, `th`, and `td`.

## Open Gaps

| Gap | Required next step |
| --- | --- |
| Tool shell layout, columns, display mode, and focus behavior need a direct Theme V2 design if tools are migrated. | Document the affected tool family, request approval, then implement reusable Theme V2 styling directly. |
| Horizontal accordion toggles need a direct Theme V2 component design if required by migrated tools. | Request approval before adding the component back. |
| Status/log/pill/role patterns need direct Theme V2 ownership decisions. | Request approval before adding reusable status primitives. |
| Dialog styling needs a direct Theme V2 primitive. | Request approval before adding dialog styles. |
| Brand/background/meaning utilities need a direct Theme V2 color-system decision. | Request approval before adding any new utility system. |
| Form row, field stack, control fieldset, and table class helpers need direct Theme V2 design approval. | Request approval before adding these helpers back. |

## Notes

- Do not use V1/legacy CSS as the source for any replacement.
- Do not compare new Theme V2 work to V1/legacy CSS as the desired target.
- Do not restore removed selectors through aliases, wrapper selectors, duplicate compatibility classes, or fallback imports.
- Not-yet-migrated page families may continue to retain their existing legacy references until their own migration PR, but migrated Theme V2 pages must not depend on V1/legacy CSS.
