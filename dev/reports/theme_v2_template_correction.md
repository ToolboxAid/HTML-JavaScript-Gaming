# PR_26152_274 Theme V2 Template Correction

## Scope

- Corrected `retired Theme V2 tool template`.
- Corrected `/dev/templates/page-template-v2.html`.
- Removed standalone/demo-looking header and footer markup from both templates.
- Rewired both templates to the shared reusable page chrome pattern.
- Kept Storage Inspector, samples, and all tools untouched.

## Corrections

| Requirement | Result |
|---|---|
| Shared reusable page chrome | PASS: both templates use `data-partial="header-nav"` and `data-partial="footer"`. |
| Existing Theme V2 header | PASS: header resolves through the shared `header-nav` partial. |
| Existing Theme V2 navigation | PASS: navigation resolves through the shared `header-nav` partial. |
| Existing Theme V2 footer | PASS: footer resolves through the shared `footer` partial. |
| Existing Theme V2 layout | PASS: templates use `page-title`, `section`, `container`, `grid`, `page-hero`, and `tool-workspace`. |
| Existing Theme V2 panels | PASS: templates use `surface`, `surface-header`, `surface-body`, `callout`, and tool panels. |
| Existing Theme V2 accordions | PASS: templates use native `details.vertical-accordion` inside approved accordion stacks/groups. |
| Existing Theme V2 status patterns | PASS: templates use `feedback`, `feedback-title`, `feedback-message`, `event-log`, and `event-log-entry`. |
| Existing Theme V2 dialogs | PASS: templates include closed `dialog` placeholders using approved surface structure. |
| Existing Theme V2 forms | PASS: templates use `form`, `field-group`, labels, inputs, selects, and `field-hint`. |
| Existing Theme V2 tables | PASS: templates use `table-wrapper` and `data-table`. |

## Guardrails

- No new CSS.
- No copied CSS.
- No inline style attributes.
- No inline script.
- No inline event handlers.
- No Storage Inspector rebuild.
- No samples touched.
- No tool rebuild started.

## Validation

- PASS: `git diff --check`
- PASS: Guard scan found no inline style attributes.
- PASS: Guard scan found no inline event handlers.
- PASS: Guard scan found no `<style>` blocks.
- PASS: Guard scan found no `assets/css/styles.css` dependency.

## Notes

- The existing external `assets/js/gamefoundry-partials.js` loader is referenced only to mount the shared reusable header/footer partials, matching production Theme V2 page chrome usage.
- The shared `image-missing.svg` from PR_26152_273 remains unchanged and is used only as a Theme V2 template placeholder asset.
