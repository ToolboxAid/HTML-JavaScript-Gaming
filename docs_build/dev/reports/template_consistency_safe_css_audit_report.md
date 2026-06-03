# PR_26154_023 Template Consistency Safe CSS Audit

Input report: `docs_build/dev/reports/template_consistency_audit_report.md` from PR_26154_022.

Scope:
- Audited public/root pages from the PR022 mismatch list that still used `assets/theme/v2/css/styles.css`.
- Inspected the aggregate stylesheet before changing references.
- Replaced `styles.css` with `theme.css` only when the page used template-critical Theme V2 structure and did not depend on selectors that are unique to the aggregate stylesheet.
- Did not create page-local CSS, tool-local CSS, inline CSS, or new Theme V2 CSS.

## Stylesheet Findings

`assets/theme/v2/css/styles.css` remains an aggregate stylesheet. It imports shared Theme V2-adjacent surfaces including `site-colors.css`, tool grouping CSS, `tokens.css`, `base.css`, `site-controls.css`, `gamefoundrystudio.css`, `pages.css`, and `tools.css`.

`assets/theme/v2/css/theme.css` is the core Theme V2 stylesheet used by the current page template. It covers the template-critical structure for the safe-replace pages below, but it does not currently provide all legacy aggregate selectors used by every page.

## Safe-Replaced Pages

The following public/root pages were classified as `safe-replace` and now reference `theme.css` instead of `styles.css`:

- `admin/controls.html`
- `admin/grouping-colors.html`
- `admin/ratings.html`
- `admin/themes.html`
- `community/index.html`
- `company/contact.html`
- `docs/index.html`
- `docs/reference.html`
- `docs/support.html`
- `games/index.html`
- `legal/cookie-policy.html`
- `legal/disclaimer.html`
- `legal/privacy-policy.html`
- `legal/terms.html`

Reason: these pages use template-critical page structure that is covered by `theme.css`, and no unique aggregate-only selectors were required for the checked template migration surface.

## Needs Extraction

The following public/root pages still depend on aggregate-only selectors and were classified as `needs-extraction`:

- `admin/branding.html`: uses `feature-image`.
- `community/assets.html`: uses `feature-image`.
- `community/publish.html`: uses `page-hero`.
- `docs/faq.html`: uses `accordion-stack`.
- `games/action/index.html`: uses `page-hero`.
- `games/adventure/index.html`: uses `page-hero`.
- `games/arcade/index.html`: uses `page-hero`.
- `games/puzzle/index.html`: uses `page-hero`.
- `games/racing/index.html`: uses `page-hero`.
- `games/retro/index.html`: uses `page-hero`.
- `games/strategy/index.html`: uses `page-hero`.
- `learn/index.html`: uses `page-hero`.

Recommended next step: promote reusable equivalents for `page-hero`, `feature-image`, and `accordion-stack` into approved Theme V2 CSS before replacing these references. No extraction or CSS authoring was performed in this PR.

## Keep For Now

- `marketplace/index.html`: kept `styles.css` while retaining the PR022-added `theme.css` link. The page still uses aggregate-only `page-hero` styling, while shared Theme V2 navigation and footer behavior comes from `theme.css`.

## Public Template Fixes

No page-title structure was added. The remaining missing page-title cases were not clear enough for a surgical template fix:

- `admin/controls.html` uses an intentional `controls-hero` structure.
- `company/about.html` uses an intentional `about-hero` structure.

## Toolbox Template Fixes

Added `theme.css` wiring to these active toolbox pages from the PR022 audit:

- `toolbox/builder/index.html`
- `toolbox/cloud/index.html`
- `toolbox/configuration-admin/index.html`
- `toolbox/creator/index.html`
- `toolbox/game-builder/index.html`
- `toolbox/game-design/index.html`
- `toolbox/localization/index.html`
- `toolbox/publish/index.html`
- `toolbox/world-vector/index.html`

Added the missing ToolDisplayMode host where the existing page already had the tool shell and script wiring:

- `toolbox/builder/index.html`
- `toolbox/creator/index.html`

Left `toolbox/cloud/index.html` as a reported mismatch. It appears to be an intentionally display-only cloud page, not a left/center/right tool shell, so this PR did not force ToolDisplayMode behavior or workspace columns into it.

## Deletions

`assets/theme/v2/css/styles.css` was not deleted. Active references remain in pages that need approved Theme V2 extraction and in active toolbox pages that still use the aggregate tool styling surface.
