# PR_26152_273 Theme V2 Template Reference Mapping

## AI Assistant To Tool Template Mapping

| AI Assistant reference area | Template extraction | Copied implementation logic |
|---|---|---|
| `page-title` with kicker, `h1`, and lede | Preserved as generic tool title area | No |
| `tool-workspace` shell | Preserved as left / center / right layout intent | No |
| Left `tool-column` with `Toolbox` header | Preserved as generic setup/options column | No |
| Native `details.vertical-accordion` | Preserved as generic accordion structure | No |
| Center `tool-center-panel` | Preserved as generic work area | No |
| Tool preview image | Replaced with shared `image-missing.svg` | No |
| Right `tool-column` with `Inspector` header | Preserved as generic output/history column | No |
| `data-tool-display-mode` display behavior | Omitted | No |
| `assets/js/gamefoundry-partials.js` and `assets/js/tool-display-mode.js` | Omitted | No |
| AI Assistant copy and ForgeBot image | Replaced with neutral template text/image | No |

## Marketplace To Page Template Mapping

| Marketplace reference area | Template extraction | Copied implementation logic |
|---|---|---|
| `page-title` with kicker, `h1`, and lede | Preserved as generic page title area | No |
| `page-hero` image/text split | Preserved as generic hero structure | No |
| Primary call-to-action button | Preserved as generic primary link | No |
| Marketplace image | Replaced with shared `image-missing.svg` | No |
| Marketplace-specific copy | Replaced with neutral template text | No |
| `assets/js/gamefoundry-partials.js` | Omitted | No |
| Legacy `../assets/css/styles.css` dependency | Omitted | No |

## Rewire Decisions

- Header/footer are static Theme V2 structural placeholders, not partial-loader implementations.
- Templates use only `../theme.css` as the Theme V2 stylesheet reference.
- `image-missing.svg` is the only shared asset added for template fallback.
- Existing tools and Marketplace remain reference-only and were not modified.

## Validation

- PASS: `git diff --check`
- PASS: No source implementation logic copied from AI Assistant.
- PASS: No source implementation logic copied from Marketplace.
- PASS: No legacy asset dependency added.

## Scope Exclusions

- No tool rebuild.
- No samples.
- No new CSS.
- No template JavaScript.
