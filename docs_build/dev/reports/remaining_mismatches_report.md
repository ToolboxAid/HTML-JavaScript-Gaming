# PR_26154_026-028 Remaining Mismatches

## Template Mismatches

Current audit result:

- Public/root pages: 43 total, 43 matching, 0 mismatches.
- Active toolbox pages: 20 total, 20 matching, 0 mismatches.

No remaining template-critical mismatches were found for:

- `_page_template_v2.html` public/root page checks.
- `toolbox/_tool_template-v2` active toolbox checks.
- `theme.css` entry wiring.
- `ToolDisplayMode` host presence.
- `ToolDisplayMode` slug attributes.
- `tool-workspace` shell presence.
- left/center/right panel markers.

## Remaining Non-Blocking Findings

- `assets/theme/v2/partials/page-shell.html` and `assets/theme/v2/partials/tool-shell.html` are present but not actively consumed by `gamefoundry-partials.js`.
- `assets/theme/v2/css/styles.css` has zero active consumers but remains referenced by deprecated/report surfaces.
- Several Theme V2 images are directly unreferenced; see `theme_v2_final_normalization_report.md`.
- Some tests still contain historical `src/engine/theme` assertions; see `legacy_surface_elimination_report.md`.

## Exclusions

The audit intentionally excludes:

- `old-tools/`.
- `old_games/`.
- `old_samples/`.
- `start_of_day/`.
- Generated reports.
- The template source files themselves when counting active pages.
