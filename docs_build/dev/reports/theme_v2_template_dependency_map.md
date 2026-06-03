# PR_26152_274 Theme V2 Template Dependency Map

## Shared Chrome Dependencies

| Dependency | Used By | Purpose | Status |
|---|---|---|---|
| `GameFoundryStudio/assets/partials/header-nav.html` | `retired Theme V2 tool template`, `_page_template_v2.html` | Shared Theme V2 header and navigation chrome | Existing |
| `GameFoundryStudio/assets/partials/footer.html` | `retired Theme V2 tool template`, `_page_template_v2.html` | Shared Theme V2 footer chrome | Existing |
| `GameFoundryStudio/assets/js/gamefoundry-partials.js` | `retired Theme V2 tool template`, `_page_template_v2.html` | Existing shared partial loader for header/footer | Existing |

## Theme V2 Style Dependencies

| Dependency | Theme V2 ownership | Template usage |
|---|---|---|
| `GameFoundryStudio/assets/css/theme/v2/theme.css` | Theme V2 aggregate | Single stylesheet reference for both templates |
| `layout.css` | Layout, page title, sections, grids, page hero, tool workspace | Page and tool layout |
| `panels.css` | Surfaces, callouts, cards, panel bodies | Content sections and tool output surfaces |
| `accordion.css` | Native accordion stack/group styling | Left/right tool panels and page details |
| `status.css` | Feedback cards and event logs | Validation/status placeholders |
| `dialogs.css` | Dialog ownership surface | Closed dialog placeholders |
| `forms.css` | Form rows, labels, inputs, selects, hints | Tool setup and page detail forms |
| `tables.css` | Table wrapper and data table styling | Metadata/output summaries |
| `buttons.css` | Primary and secondary actions | Template action links/buttons |
| `colors.css` | Semantic/body meaning and group color classes | Tool grouping and accent classes |
| `typography.css` | Kicker, headings, lede, body copy | Page and tool copy structure |

## Asset Dependencies

| Dependency | Used By | Purpose | Status |
|---|---|---|---|
| `GameFoundryStudio/assets/images/favicon.svg` | Both templates | Existing site favicon | Existing |
| `src/engine/theme/v2/assets/image-missing.svg` | Both templates | Shared Theme V2 template placeholder | Existing from PR_26152_273 |

## Explicit Non-Dependencies

- No `assets/css/styles.css`.
- No page-local CSS.
- No copied CSS.
- No inline script.
- No inline style.
- No inline event handlers.
- No Storage Inspector files.
- No sample files.

## Validation

- PASS: `git diff --check`
- PASS: Dependency review confirms templates use shared chrome plus existing Theme V2 classes.
