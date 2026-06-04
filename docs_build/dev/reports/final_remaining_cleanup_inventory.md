# PR_26154_034-036 Final Remaining Cleanup Inventory

## Completed In This Stack

- Added missing active toolbox pages to the toolbox index grouping:
  - Configuration Admin
  - Tool Builder
  - Tool Creator
- Confirmed all 20 active toolbox pages are header-wired, index-wired, and template-marker complete.
- Moved deprecated preview-generator support from `toolbox/shared/preview/` to `archive/v1-v2/tools/shared-preview/`.
- Confirmed active Theme V2 references resolve and no active `styles.css` dependency remains.

## Remaining Cleanup Candidates

| Candidate | Classification | Recommended Follow-Up |
| --- | --- | --- |
| `toolbox/toolRegistry.js` | Ambiguous active/legacy bridge | Split active registry from legacy registry, then move legacy entries to `archive/v1-v2/tools` ownership. |
| `toolbox/renderToolsIndex.js` | Ambiguous legacy renderer | Decide whether it remains an active validation target or moves with legacy registry/rendering support. |
| `assets/theme-v2/css/styles.css` | Unwired aggregate | Remove in a dedicated Theme V2 CSS residue PR if no external consumer exists. |
| `assets/theme-v2/css/site-colors.css`, `site-controls.css`, `gamefoundrystudio.css`, `pages.css`, `tokens.css` | Unwired or aggregate-era residue | Confirm whether any are intended design-system modules, then delete or wire intentionally. |
| `assets/theme-v2/css/tools/grouping/*.css` | Unwired grouping residue | Consolidate with active `colors.css` ownership or rewire intentionally. |
| `assets/theme-v2/partials/page-shell.html` and `tool-shell.html` | Unwired partial stubs | Delete or wire through a documented partial-loader contract. |
| `assets/theme-v2/images/icons/*` | Unwired icon image set | Decide whether icons are future image assets or move/delete as residue. |
| `assets/theme-v2/images/ChatGPT Image*.png`, `forge-bot.svg`, `magic-panel.png`, `toolboxaid-header.png`, typo variants | Unwired image candidates | Delete or relocate after visual asset ownership review. |
| `tests/games/` | Deprecated-adjacent/ambiguous | Separate active game tests from deprecated old-game tests before pruning. |
| `tests/validation/samples.*.json` | Historical/ambiguous fixtures | Retire only after contract tests stop using sample report fixtures. |
| Historical docs mentioning `toolbox/shared/preview/` | Historical docs | Update only in a docs-history normalization PR, not runtime cleanup. |

## Current Active Structure Confirmation

- `toolbox/`: active toolbox pages, active toolbox index, template source, schemas, and shared/validation support.
- `archive/v1-v2/tools/`: deprecated tools and legacy support, now including `shared-preview/`.
- `games/`: active public game discovery/type pages.
- `archive/v1-v2/games/`: deprecated playable reference games.
- `archive/v1-v2/samples/`: deprecated reference samples.
- `scripts/`: active validation and artifact tooling.
- `tests/`: active and ambiguous validation inventory, with deprecated-only tests already pruned in prior stack.
