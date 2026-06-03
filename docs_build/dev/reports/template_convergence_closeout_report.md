# PR_26154_026 Template Convergence Closeout

Baseline used: `PR_26154_025-cloud-template-styles-cleanup`.

## Scope

- Re-ran the public/root page audit against `_page_template_v2.html`.
- Re-ran the active toolbox page audit against `toolbox/_tool_template-v2`.
- Fixed only clear template contract gaps.

## Before Counts

Input source: `docs_build/dev/reports/template_consistency_before_after_report.md` from PR_26154_025.

| Surface | Total | Matching | Mismatches |
| --- | ---: | ---: | ---: |
| Public/root pages | 43 | 41 | 2 |
| Active toolbox pages | 20 | 20 | 0 |

## Fixes Applied

- `admin/controls.html`: added the `page-title` template marker to the existing `controls-hero` section.
- `company/about.html`: added the `page-title` template marker to the existing `about-hero` section.
- `toolbox/builder/index.html`: added explicit ToolDisplayMode data attributes.
- `toolbox/configuration-admin/index.html`: added explicit ToolDisplayMode data attributes.
- `toolbox/creator/index.html`: added explicit ToolDisplayMode data attributes.
- `toolbox/game-builder/index.html`: added explicit ToolDisplayMode data attributes.
- `toolbox/game-design/index.html`: added explicit ToolDisplayMode data attributes.
- `toolbox/publish/index.html`: added explicit ToolDisplayMode data attributes.
- `toolbox/world-vector/index.html`: added explicit ToolDisplayMode data attributes.

No page body content was rewritten. No left/center/right column layout was changed.

## After Counts

| Surface | Total | Matching | Mismatches |
| --- | ---: | ---: | ---: |
| Public/root pages | 43 | 43 | 0 |
| Active toolbox pages | 20 | 20 | 0 |

## Contract Checks

Public/root checks:

- Theme V2 `theme.css` entry wiring.
- No active `styles.css` aggregate wiring.
- `page-title` marker on non-home public/root pages.

Active toolbox checks:

- Theme V2 `theme.css` entry wiring.
- `data-tool-display-mode`.
- `data-tool-slug`.
- `tool-display-mode.js`.
- `tool-workspace`.
- left/right `tool-column` markers.
- `tool-center-panel`.

## Validation Notes

- Full samples smoke test skipped by request.
- Tests against `old-tools/`, `old_games/`, and `old_samples/` skipped by request.
- `npm run test:workspace-v2` is required for this stack because active toolbox display-mode wiring changed.
