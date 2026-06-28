# Tool Template Path Adjustments

Task: PR_26152_276-tool-template-baseline-copy

## Adjustments

| File | Reference | Original | Updated | Reason |
| --- | --- | --- | --- | --- |
| `dev/templates/tool-template-v2.html` | `<base href>` | `../GameFoundryStudio/` | `../../GameFoundryStudio/` | The copied page moved from `toolbox/ai-assistant.html` to `dev/templates/tool-template-v2.html`, one directory deeper than the original source page. |

## Unchanged References

- CSS references remain `assets/css/styles.css` and `assets/css/theme/v2/theme.css`.
- JS references remain `assets/js/gamefoundry-partials.js` and `assets/js/tool-display-mode.js`.
- Asset references remain under `assets/images`.
- Partial references remain `header-nav` and `footer`.

These references are intentionally unchanged because they resolve relative to the corrected `<base href="../../GameFoundryStudio/">`.
