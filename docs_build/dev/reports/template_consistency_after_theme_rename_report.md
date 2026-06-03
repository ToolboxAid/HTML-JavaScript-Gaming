# PR_26154_029 Template Consistency After Theme Rename

Baseline used: `PR_26154_026-028-template-theme-legacy-closeout`.

## Audit Criteria

Public/root pages were checked for:

- `assets/theme-v2/css/theme.css`
- no `assets/theme/v2` references
- no active `assets/theme-v2/css/styles.css` references
- `page-title` marker on non-home public/root pages

Active toolbox pages were checked for:

- `assets/theme-v2/css/theme.css`
- no `assets/theme/v2` references
- no active `assets/theme-v2/css/styles.css` references
- `data-tool-display-mode`
- `data-tool-slug`
- `tool-display-mode.js`
- `tool-workspace`
- left/right `tool-column` markers
- `tool-center-panel`

The audit excludes:

- `old-tools/`
- `old_games/`
- `old_samples/`
- `start_of_day/`
- generated reports
- template source files when counting active pages

## Results

| Surface | Total | Matching | Mismatches |
| --- | ---: | ---: | ---: |
| Public/root pages | 43 | 43 | 0 |
| Active toolbox pages | 20 | 20 | 0 |

## Template Sources

- `_page_template_v2.html` references `assets/theme-v2`.
- `toolbox/_tool_template-v2/index.html` references `assets/theme-v2`.

## Result

No active template-critical mismatches remain after the Theme V2 root rename.
