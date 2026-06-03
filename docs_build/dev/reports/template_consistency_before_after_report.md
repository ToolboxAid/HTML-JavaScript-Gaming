# PR_26154_023 Template Consistency Before/After

Input report: `docs_build/dev/reports/template_consistency_audit_report.md`.

The rerun audit used the same template-critical scope as PR_26154_022: CSS wiring, shared template labels/slots, header/footer partials, public page-title presence where applicable, ToolDisplayMode host wiring, tool display script wiring, and left/center/right toolbox shell markers. The root homepage was counted as a public/root page but was not required to use the ordinary `page-title` section.

## Counts

| Surface | Before total | Before matching | Before mismatches | After total | After matching | After mismatches |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Public/root pages | 43 | 15 | 28 | 43 | 28 | 15 |
| Active toolbox pages | 20 | 11 | 9 | 20 | 19 | 1 |

## Remaining Public/Root Mismatches

- `admin/branding.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `admin/controls.html`: missing page-title section.
- `community/assets.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `community/publish.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `company/about.html`: missing page-title section.
- `docs/faq.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `games/action/index.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `games/adventure/index.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `games/arcade/index.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `games/puzzle/index.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `games/racing/index.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `games/retro/index.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `games/strategy/index.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `learn/index.html`: missing `theme.css` link; uses `styles.css` aggregate.
- `marketplace/index.html`: still uses `styles.css` aggregate. It also keeps the existing `theme.css` link from PR_26154_022.

## Remaining Toolbox Mismatch

- `toolbox/cloud/index.html`: missing ToolDisplayMode host, `tool-display-mode.js`, `tool-workspace` shell, two side tool columns, and center tool panel.

Reason kept: `toolbox/cloud/index.html` appears to be an intentionally display-only cloud page. This PR did not convert it into an interactive left/center/right tool shell.

## Net Result

- Public/root mismatches reduced by 13.
- Active toolbox mismatches reduced by 8.
- No new CSS was added.
- No page-local, tool-local, or inline CSS was introduced.
- No display-only page was forcibly converted into a tool shell.
