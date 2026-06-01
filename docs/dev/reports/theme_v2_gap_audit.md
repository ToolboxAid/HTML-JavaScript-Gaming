# Theme V2 Gap Audit - PR_26152_029-theme-v2-gap-audit

## Scope

- Audited every CSS file under `GameFoundryStudio/assets/css/theme/v2/`.
- Documentation-only PR. No CSS, HTML, or JavaScript was changed.
- Playwright impacted: No. This PR is docs/workflow only.
- Compared current Theme V2 CSS with the prior CSS-foundation commit and searched existing GameFoundryStudio CSS sources for matching selectors and patterns.

## Audit Inputs

- Theme V2 files audited:
  - `GameFoundryStudio/assets/css/theme/v2/accordion.css`
  - `GameFoundryStudio/assets/css/theme/v2/buttons.css`
  - `GameFoundryStudio/assets/css/theme/v2/colors.css`
  - `GameFoundryStudio/assets/css/theme/v2/controls.css`
  - `GameFoundryStudio/assets/css/theme/v2/dialogs.css`
  - `GameFoundryStudio/assets/css/theme/v2/forms.css`
  - `GameFoundryStudio/assets/css/theme/v2/layout.css`
  - `GameFoundryStudio/assets/css/theme/v2/panels.css`
  - `GameFoundryStudio/assets/css/theme/v2/spacing.css`
  - `GameFoundryStudio/assets/css/theme/v2/status.css`
  - `GameFoundryStudio/assets/css/theme/v2/tables.css`
  - `GameFoundryStudio/assets/css/theme/v2/theme.css`
  - `GameFoundryStudio/assets/css/theme/v2/typography.css`
- Legacy comparison sources inspected:
  - `GameFoundryStudio/assets/css/gamefoundrystudio.css`
  - `GameFoundryStudio/assets/css/colors.css`
  - `GameFoundryStudio/assets/css/controls.css`
  - `GameFoundryStudio/assets/css/pages.css`

## Required Pattern Classification

| Pattern | Current owner | Classification | Evidence | Audit finding |
| --- | --- | --- | --- | --- |
| Horizontal accordion toggle | `accordion.css` | Moved existing CSS, normalized | Existing selectors in `GameFoundryStudio/assets/css/gamefoundrystudio.css`: `.horizontal-accordion-toggle`, directional states, generated arrow, and tool-column variants. | Existing pattern, not a new component design. Keep future changes limited to migration/normalization unless separately approved. |
| Tool display mode | `panels.css`, `accordion.css`, `layout.css` | Moved existing CSS, split by ownership | Existing selectors in `GameFoundryStudio/assets/css/gamefoundrystudio.css`: `.tool-display-mode`, summary arrow, badge/body/character/fullscreen/description, and focus-mode variants. | Existing pattern. The split across panel, accordion, and layout ownership is reasonable, but future expansion should be approval-gated because it behaves like a tool shell pattern. |
| Tool columns | `panels.css`, `accordion.css`, `layout.css`, `spacing.css` | Moved existing CSS, consolidated duplicate shell rules | Existing selectors in `GameFoundryStudio/assets/css/gamefoundrystudio.css`: `.tool-workspace`, `.tool-column`, collapsed states, center panel, responsive rules, and focus-mode rules. | Existing tool shell layout. The audit treats this as migrated foundation, not permission to create new layout systems during migration. |
| Tool column headers | `panels.css`, `colors.css`, `accordion.css` | Moved existing CSS, color concerns separated | Existing selectors in `GameFoundryStudio/assets/css/gamefoundrystudio.css` and `GameFoundryStudio/assets/css/colors.css`: `.tool-column-header`, heading colors, named color variants, group accent variables. | Existing pattern. Color-only variants belong in `colors.css`; structural header styling belongs in `panels.css`. |
| Table styling | `tables.css` | Moved existing CSS and consolidated generic table baseline | Existing selectors in `GameFoundryStudio/assets/css/gamefoundrystudio.css`: `.table-wrapper`, `.table`, `.table th`, `.table td`; existing generic `table` styling in `GameFoundryStudio/assets/css/controls.css`. | Existing table pattern. No new table design found. |
| Status styling | `status.css` | Moved existing CSS | Existing selectors in `GameFoundryStudio/assets/css/gamefoundrystudio.css`: `.status`, `.log`, `.pill`, `.role`, `.tool-card .role:last-child`, `.tool-group-label`, `.tool-group-swatch`. | Existing status/metadata pattern. `.tool-group-label` and `.tool-group-swatch` are listing metadata, not status messaging, and should be revisited during the tools index migration. |
| Dialog styling | `dialogs.css` | Moved existing CSS, possible one-off retained | Existing generic `dialog` styling in `GameFoundryStudio/assets/css/controls.css`; `.dialog-sample` existed in `GameFoundryStudio/assets/css/pages.css`. | Generic `dialog` ownership is valid. `.dialog-sample` is sample/demo-specific and remains a possible one-off until a migrated page proves it is reusable. |
| Brand color utilities | `colors.css` | Existing utility pattern moved from legacy colors | Existing selectors and variables in `GameFoundryStudio/assets/css/colors.css`: `meaning-*`, `brand-color-*`, `brand-background-*`, `side-*`, swatches, and tool group color variables. | Existing color utility surface. Future additions would be a new color system unless explicitly approved. |

## File-by-File Classification

| File | Moved existing CSS | Consolidated duplicate CSS | Newly created CSS | Possible one-off CSS | Ownership mismatches |
| --- | --- | --- | --- | --- | --- |
| `theme.css` | Import hub only. | Consolidates the approved Theme V2 import order. | None. | None. | None. |
| `colors.css` | Brand tokens, meaning classes, swatches, side accents, tool-group colors, and tool-column color variants mirror legacy color surfaces. | Consolidates brand and tool-group color concerns that previously appeared in legacy color and page/tool CSS. | New token names exist only as ownership normalization for existing values. | `brand-background-*` and `meaning-*` are broad utilities and should not be expanded without approval. | Component-named selectors such as `.tool-column-header.*` are acceptable only because they define color state. |
| `spacing.css` | Tool shell, dialog, card image, and focus dimensions were extracted from existing legacy values. | Consolidates hardcoded repeated sizes into tokens. | New token names were introduced, but they represent existing measures rather than new visuals. | Tool-shell tokens are coupled to the current tool layout and should not become a broader layout system without approval. | None. |
| `typography.css` | Body, heading, paragraph, link, list, code, `kicker`, and `lede` styles match existing migrated typography concerns. | Consolidates base typography. | None identified in this audit. | None. | None. |
| `layout.css` | Page containers, nav/footer layout, grids, admin stacks, tool workspace, tool grid, and focus-mode rules match existing legacy layout selectors. | Consolidates duplicated layout rules from legacy page and tool surfaces. | No new visual layout found for named patterns; focus-mode token names are normalization. | Tool focus mode is broad and should be approval-gated for future expansion. | Some tool-shell behavior sits in global layout ownership by necessity; future tool-specific variants should be treated as gaps. |
| `buttons.css` | `.btn`, `.button-row`, `.inline-row`, and `.return-to-top` match existing legacy button/action patterns. | Consolidates button row and return-to-top behavior. | Hover/disabled states are normalized onto existing button classes. | None. | `.return-to-top` uses `--accordion-button-*` custom property names; rename during a future approved cleanup to avoid accordion-specific naming in button ownership. |
| `forms.css` | `.field`, `.form-row`, `fieldset`, labels, inputs, selects, ranges, meter, and `.control-fieldset` match legacy form/control patterns. | Consolidates repeated form and control fieldset rules. | None identified. | None. | None. |
| `controls.css` | Switch, slider, choice, control demo, and tool-group control accent rules match existing controls CSS. | Consolidates reusable control behavior. | None identified. | None. | None. |
| `panels.css` | Cards, panels, mini stats, side menu, brand swatches, mascot/stage cards, tool cards, tool columns, tool display bodies, about/game/release panels match existing page and tool patterns. | Consolidates duplicate card and panel surfaces. | No new named visual component found for the required patterns. | `dialog-sample` is not here; panel-specific page sections such as release/about patterns should remain migration-bound until those families are in scope. | `brand-color-code` and `brand-color-swatch` are visual color samples in panel ownership; consider moving to color ownership only with approval. |
| `accordion.css` | Native details/summary, vertical accordion, horizontal toggle, tool-column accordion spacing, group accent toggles, and tool display summary arrows match existing legacy selectors. | Consolidates vertical and horizontal accordion behaviors. | None identified for the required accordion pattern. | Tool display summary arrows are tightly coupled to one tool shell pattern. | Tool-display summary rules are split here because they are disclosure controls; document before expanding. |
| `status.css` | `.status`, `.log`, `.pill`, `.role`, `.tool-group-label`, and `.tool-group-swatch` match existing legacy selectors. | Consolidates status/log/meta badge rules. | None identified. | `.tool-group-label` and `.tool-group-swatch` may belong to tools index metadata rather than status. | Potential ownership mismatch for tool-group label/swatch; revisit during tools index migration. |
| `tables.css` | `.table-wrapper`, `table`, `.table`, captions, cells, and headers match existing table rules. | Consolidates generic table and `.table` class rules. | None identified. | None. | None. |
| `dialogs.css` | Generic `dialog` and `.dialog-sample` styles match existing legacy controls/pages CSS. | Consolidates dialog baseline and demo sample styling. | None identified for generic dialog styling. | `.dialog-sample` is possible one-off/demo styling. | `.dialog-sample` may need a reusable name or removal when the owning page migrates. |

## Missing Approved Ownership Files

None. All approved Theme V2 ownership files exist:

- `theme.css`
- `colors.css`
- `controls.css`
- `typography.css`
- `spacing.css`
- `buttons.css`
- `forms.css`
- `panels.css`
- `accordion.css`
- `status.css`
- `tables.css`
- `dialogs.css`
- `layout.css`

`theme.css` imports every approved ownership file except itself.

## Newly Created CSS Classification

- No confirmed new visual component design was found among the specifically requested patterns.
- New Theme V2 token names were introduced during consolidation to represent existing legacy values, especially in `spacing.css` and `colors.css`.
- Broad utility surfaces such as `brand-background-*`, `meaning-*`, and tool-shell layout tokens already existed in legacy CSS, but the audit classifies future expansion of those surfaces as approval-gated under the new Theme V2 Consolidation Rule.

## Possible One-Off CSS

- `.dialog-sample` in `dialogs.css`: legacy sample/demo pattern; keep documented as a possible one-off until a migrated page proves reusable ownership.
- `.brand-color-code` and `.brand-color-swatch` in `panels.css`: existing branding sample presentation; possible color-ownership candidate during the Branding/Admin migration.
- Tool display mode and tool focus mode: existing tool shell pattern, but broad enough that new variants should be treated as design-system gaps until approved.

## Ownership Mismatches

- `buttons.css`: `.return-to-top` reuses `--accordion-button-*` custom property names. Behavior is button-owned; naming is accordion-specific.
- `status.css`: `.tool-group-label` and `.tool-group-swatch` are tools-index metadata rather than status messaging.
- `panels.css`: `brand-color-code` and `brand-color-swatch` may belong in `colors.css` if they become reusable color documentation utilities.
- `dialogs.css`: `.dialog-sample` names a sample/demo use case rather than a reusable dialog primitive.

## Design-System Gaps

- Add an approved "tool shell" ownership decision before extending tool workspace, focus mode, tool columns, or tool display mode beyond migration of existing patterns.
- Add an approved naming cleanup for button-like custom properties currently named `--accordion-button-*`.
- Decide whether branding color samples belong to `colors.css` or remain panel presentation patterns.
- Decide whether `.dialog-sample` should be renamed into a reusable dialog content pattern or left behind when its page migrates.
- Do not add missing variants during migration. Document the gap, stop, and request approval first.

## Documentation Validation

Lanes executed:
- contract documentation/static validation because this PR changes governance docs and produces an audit report only.

Lanes skipped:
- runtime, integration, engine, samples, and recovery/UAT because no CSS, HTML, JavaScript, runtime, engine, sample, or UAT behavior changed.

Samples decision:
- SKIP because this is documentation/report validation only.

Expected PASS behavior:
- Theme V2 audit report exists at `docs/dev/reports/theme_v2_gap_audit.md`.
- `docs/dev/PROJECT_INSTRUCTIONS.md` contains `### Theme V2 Consolidation Rule`.
- `git diff --name-only` has no changed `.css`, `.html`, or `.js` files.

Expected WARN behavior:
- Legacy CSS may still contain duplicated deprecated selectors because this PR is audit-only and does not remove CSS.
