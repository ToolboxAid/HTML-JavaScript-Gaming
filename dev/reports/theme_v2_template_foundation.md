# PR_26152_273 Theme V2 Template Foundation

## Scope

- Created `retired Theme V2 tool template`.
- Created `/_page_template_v2.html`.
- Added `assets/theme/v2/images/image-missing.svg` because no existing `image-missing.svg` was present.
- Used AI Assistant only as the tool layout reference.
- Used Marketplace only as the page layout reference.
- Extracted layout intent only.

## Template Boundaries

- No AI Assistant implementation logic copied.
- No Marketplace implementation logic copied.
- No legacy CSS or asset references added.
- No `GameFoundryStudio/assets` dependency added.
- No external script dependency added.
- No inline script added.
- No inline style attributes added.
- No inline event handlers added.
- No new CSS created.
- No templates beyond the two requested foundations were created.

## Template Locations

| Template | Location | Reference | Intent |
|---|---|---|---|
| Tool Template V2 | `retired Theme V2 tool template` | `toolbox/ai-assistant.html` | Three-region tool workspace: left setup, center work area, right inspector. |
| Page Template V2 | `/_page_template_v2.html` | `GameFoundryStudio/marketplace/index.html` | Page title plus hero media/content section and repeated content blocks. |
| Missing Image | `assets/theme/v2/images/image-missing.svg` | New shared placeholder | Shared template image fallback only. |

## Theme V2 Pattern Usage

- Templates reference `../theme.css` only.
- Layout classes use existing Theme V2 vocabulary such as `site-header`, `container`, `nav`, `page-title`, `section`, `tool-workspace`, `tool-column`, `tool-center-panel`, `accordion-stack`, `vertical-accordion`, `page-hero`, `grid`, `cols-3`, `callout`, `btn`, and `footer`.
- Accordions use native `<details>` / `<summary>` structure.
- Buttons use `<button>` for template tool commands and `<a>` for template page navigation.

## Validation

- PASS: `git diff --check`
- PASS: Template guard scan found no `<script>` tags.
- PASS: Template guard scan found no inline `style` attributes.
- PASS: Template guard scan found no inline event handlers.
- PASS: Template guard scan found no legacy asset dependencies.

## Scope Exclusions

- No tool rebuild.
- No samples.
- No Marketplace implementation logic.
- No AI Assistant implementation logic.
- No template runtime behavior.
