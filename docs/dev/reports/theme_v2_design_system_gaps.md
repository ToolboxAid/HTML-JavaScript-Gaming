# Theme V2 Design System Gaps

PR: `PR_26152_028-theme-v2-css-foundation`

## Resolved Foundation Gaps

| Gap | Resolution |
| --- | --- |
| Reusable meaning color utilities were still only in deprecated CSS. | Added meaning color variables/classes to `theme/v2/colors.css`. |
| Brand color/background utilities were not available from theme v2. | Added reusable brand color/background utility classes to `theme/v2/colors.css`. |
| Status/log/pill/role label patterns were missing from theme v2. | Added reusable status and label patterns to `theme/v2/status.css`. |
| Dialog baseline and dialog sample panels were missing from theme v2. | Added reusable dialog patterns to `theme/v2/dialogs.css`. |
| Tool workspace, tool cards, tool columns, display-mode panels, and horizontal accordion toggles were only available from deprecated CSS. | Added reusable tool shell/layout/card/toggle patterns to approved `theme/v2` ownership files without changing tool imports. |
| Form field stacks, form rows, and control fieldsets were not fully represented in theme v2. | Added reusable form helpers to `theme/v2/forms.css`. |
| `.table` class styling was not fully represented in theme v2. | Added reusable `.table` rules to `theme/v2/tables.css`. |

## Unresolved Gaps

| Gap | Reason Deferred |
| --- | --- |
| Deprecated GameFoundryStudio CSS files still serve unmigrated page families. | Account, Tools, Games, Samples, and other page-family import migrations are explicitly out of scope for this PR. |
| Tool-local CSS such as the Localization Studio stylesheet still exists outside theme v2. | Tool family migration is explicitly out of scope for this PR. |
| Deprecated page-specific selectors that require markup changes were not promoted. | This PR only consolidates existing reusable patterns and does not change page markup or imports. |

## Scope Notes

- No page-local CSS was added.
- No tool-local CSS was added.
- No CSS was added outside `GameFoundryStudio/assets/css/theme/v2/`.
- No Admin, Account, Tools, Games, or Samples page imports were changed.
