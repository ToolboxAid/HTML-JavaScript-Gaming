# PR_26154_031 Toolbox Template Mismatch Closeout

Baseline used: latest applied root/theme/toolbox migration state after `PR_26154_030-toolbox-nav-character-closeout`.

## Scope

- Re-ran the public/root page template consistency audit against `_page_template_v2.html`.
- Re-ran the active toolbox page template consistency audit against `toolbox/_tool_template-v2`.
- Checked active `styles.css` usage.
- Fixed only clear template/path contract gaps.

## Fixes Applied

| File | Fix | Reason |
| --- | --- | --- |
| `admin/grouping-colors.html` | Updated Theme V2 grouping CSS copy from `assets/css/tools/grouping/` to `assets/theme-v2/css/tools/grouping/`. | The old path no longer exists after Theme V2 root normalization. |
| `docs_build/account/grouping-colors.html` | Updated Theme V2 grouping CSS copy from `assets/css/tools/grouping/` to `assets/theme-v2/css/tools/grouping/`. | Keeps the documentation mirror aligned with the active Theme V2 asset root. |

No active toolbox page structure was rewritten. No local CSS or JS was created.

## Template Audit

Audit criteria:

- Public/root pages: `assets/theme-v2/css/theme.css`, no active `assets/theme/v2`, no active `assets/theme-v2/css/styles.css`, and `page-title` on non-home public/root pages.
- Active toolbox pages: `assets/theme-v2/css/theme.css`, `data-tool-display-mode`, `data-tool-slug`, `tool-display-mode.js`, `tool-workspace`, at least two `tool-column` markers, and `tool-center-panel`.
- Excluded `archive/v1-v2/tools/`, `archive/v1-v2/games/`, `archive/v1-v2/samples/`, `start_of_day/`, generated reports, and template source files when counting active pages.

| Surface | Before | After | Remaining Mismatches |
| --- | ---: | ---: | ---: |
| Public/root pages | 43/43 | 43/43 | 0 |
| Active toolbox pages | 20/20 | 20/20 | 0 |

## styles.css Audit

- Active public/root and toolbox pages do not reference `assets/theme-v2/css/styles.css`.
- `assets/theme-v2/css/styles.css` remains present as an aggregate CSS artifact, but it is not active page wiring and was not deleted in this scoped PR.

## Validation

- PASS template consistency audit: public/root pages `43/43`.
- PASS template consistency audit: active toolbox pages `20/20`.
- PASS active styles.css reference check: zero active references to `assets/theme-v2/css/styles.css`.
- PASS changed JavaScript syntax checks.
- PASS `npm run test:playwright:static`.
- PASS `npm run test:workspace-v2`.
