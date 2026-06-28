# PR_26154_022 Template Consistency Audit

Sources compared: `/dev/templates/page-template-v2.html` for public/root pages and `dev/templates/tool-template-v2.html` for active toolbox pages.
Audit scope was limited to CSS wiring, shared partial labels/slots, shared IDs, header/nav/footer presence, ToolDisplayMode host wiring, left/center/right shell markers, and consistency-critical attributes.

## Fixes Applied
- `marketplace/index.html` now loads `../assets/theme/v2/css/theme.css` after the existing aggregate stylesheet so shared Theme V2 nav/footer behavior is present without removing page-specific helpers.
- `assets/theme/v2/partials/footer.html` was aligned to the requested footer IA.
- `assets/theme/v2/js/gamefoundry-partials.js` now treats `toolbox` as the active root route and section for nav highlighting.

## Public/Root Pages
- Audited pages: 43
- Pages matching checked template-critical markers: 15
- Pages with remaining mismatches: 28

### Remaining Public/Root Mismatches
- `admin/branding.html`: missing theme.css link; uses styles.css aggregate
- `admin/controls.html`: missing theme.css link; uses styles.css aggregate; missing page-title section
- `admin/grouping-colors.html`: missing theme.css link; uses styles.css aggregate
- `admin/ratings.html`: missing theme.css link; uses styles.css aggregate
- `admin/themes.html`: missing theme.css link; uses styles.css aggregate
- `community/assets.html`: missing theme.css link; uses styles.css aggregate
- `community/index.html`: missing theme.css link; uses styles.css aggregate
- `community/publish.html`: missing theme.css link; uses styles.css aggregate
- `company/about.html`: missing page-title section
- `company/contact.html`: missing theme.css link; uses styles.css aggregate
- `docs/faq.html`: missing theme.css link; uses styles.css aggregate
- `docs/index.html`: missing theme.css link; uses styles.css aggregate
- `docs/reference.html`: missing theme.css link; uses styles.css aggregate
- `docs/support.html`: missing theme.css link; uses styles.css aggregate
- `games/action/index.html`: missing theme.css link; uses styles.css aggregate
- `games/adventure/index.html`: missing theme.css link; uses styles.css aggregate
- `games/arcade/index.html`: missing theme.css link; uses styles.css aggregate
- `games/index.html`: missing theme.css link; uses styles.css aggregate
- `games/puzzle/index.html`: missing theme.css link; uses styles.css aggregate
- `games/racing/index.html`: missing theme.css link; uses styles.css aggregate
- `games/retro/index.html`: missing theme.css link; uses styles.css aggregate
- `games/strategy/index.html`: missing theme.css link; uses styles.css aggregate
- `legal/cookie-policy.html`: missing theme.css link; uses styles.css aggregate
- `legal/disclaimer.html`: missing theme.css link; uses styles.css aggregate
- `legal/privacy-policy.html`: missing theme.css link; uses styles.css aggregate
- `legal/terms.html`: missing theme.css link; uses styles.css aggregate
- `learn/index.html`: missing theme.css link; uses styles.css aggregate
- `marketplace/index.html`: uses styles.css aggregate

## Toolbox Pages
- Audited active toolbox pages: 20
- Pages matching checked tool-template markers: 11
- Pages with remaining mismatches: 9

### Remaining Toolbox Mismatches
- `toolbox/builder/index.html`: missing theme.css link used by tool template; missing ToolDisplayMode host
- `toolbox/cloud/index.html`: missing theme.css link used by tool template; missing ToolDisplayMode host; missing tool-display-mode.js; missing tool-workspace shell; missing two side tool columns; missing center tool panel
- `toolbox/configuration-admin/index.html`: missing theme.css link used by tool template
- `toolbox/creator/index.html`: missing theme.css link used by tool template; missing ToolDisplayMode host
- `toolbox/game-builder/index.html`: missing theme.css link used by tool template
- `toolbox/game-design/index.html`: missing theme.css link used by tool template
- `toolbox/localization/index.html`: missing theme.css link used by tool template; missing tool-workspace shell
- `toolbox/publish/index.html`: missing theme.css link used by tool template
- `toolbox/world-vector/index.html`: missing theme.css link used by tool template

## Notes
- `toolbox/index.html` is a landing page, not an individual tool page, and was excluded from the tool-template shell comparison.
- `toolbox/shared/preview/*.html`, `toolbox/dev/`, and `toolbox/schemas/` were excluded because they are shared/development/schema surfaces rather than active tool pages.
- The remaining CSS split is reported rather than mass-fixed to avoid broad visual rewrites in this PR.
