# Theme V2 Design System Gaps

PR: `PR_26152_027-theme-v2-admin-pages`

## Newly Discovered Gaps

The Admin migration found that `theme/v2` did not yet include reusable patterns for several Admin/reference surfaces that already existed in deprecated CSS.

| Gap | Affected Admin pages | Resolution |
| --- | --- | --- |
| Admin side-navigation shell and stacked content area | All Admin pages | Added reusable `account-panel`, `side-menu`, and `admin-page-stack` rules under `theme/v2`. |
| Reference mini-stat and brand swatch presentation | Branding, Grouping Colors | Added reusable `mini-stat`, `brand-color-code`, `brand-color-swatch`, and swatch/accent utilities under `theme/v2`. |
| Controls reference layout, switch, choice, and group accents | Controls | Added reusable controls-demo, switch, choice, side accent, and tool-group accent rules under `theme/v2`. |
| Table wrapper and table baseline | Grouping Colors | Added reusable table wrapper and table rules under `theme/v2/tables.css`. |
| Vertical accordion pattern | Grouping Colors | Added reusable `vertical-accordion` and `accordion-body` rules under `theme/v2/accordion.css`. |
| Form/list/definition-list baseline needed by Admin reference pages | Controls, Design System, Grouping Colors, Ratings | Added reusable form and typography baseline rules under `theme/v2/forms.css` and `theme/v2/typography.css`. |
| Missing Admin Controls image asset reference | Controls | Corrected `controls.html` to use existing `../assets/images/forgebot.png`. |

## Unresolved Gaps

None for this PR's Admin migration scope.

## Scope Notes

- No page-local CSS was added.
- No CSS was added outside `GameFoundryStudio/assets/css/theme/v2/`.
- Account, Tools, Games, and Samples were not migrated.
