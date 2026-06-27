# PR_26154_020 Theme V2 CSS Structure Normalization Report

Task: `PR_26154_020-theme-v2-css-structure-normalization`

## Scope

- Normalized the duplicate nested path `assets/theme/v2/css/theme/v2/`.
- Moved Theme V2 core CSS modules to `assets/theme/v2/css/`.
- Kept tool-specific CSS under `assets/theme/v2/css/tools/`.
- Kept grouping CSS under `assets/theme/v2/css/tools/grouping/`.
- Did not move Font Awesome CSS from `assets/theme/v2/fonts/fontawesome/css/`.

## CSS Moves

| Old path | New path |
| --- | --- |
| `assets/theme/v2/css/theme/v2/theme.css` | `assets/theme/v2/css/theme.css` |
| `assets/theme/v2/css/theme/v2/colors.css` | `assets/theme/v2/css/colors.css` |
| `assets/theme/v2/css/theme/v2/spacing.css` | `assets/theme/v2/css/spacing.css` |
| `assets/theme/v2/css/theme/v2/typography.css` | `assets/theme/v2/css/typography.css` |
| `assets/theme/v2/css/theme/v2/layout.css` | `assets/theme/v2/css/layout.css` |
| `assets/theme/v2/css/theme/v2/buttons.css` | `assets/theme/v2/css/buttons.css` |
| `assets/theme/v2/css/theme/v2/forms.css` | `assets/theme/v2/css/forms.css` |
| `assets/theme/v2/css/theme/v2/controls.css` | `assets/theme/v2/css/controls.css` |
| `assets/theme/v2/css/theme/v2/panels.css` | `assets/theme/v2/css/panels.css` |
| `assets/theme/v2/css/theme/v2/accordion.css` | `assets/theme/v2/css/accordion.css` |
| `assets/theme/v2/css/theme/v2/status.css` | `assets/theme/v2/css/status.css` |
| `assets/theme/v2/css/theme/v2/tables.css` | `assets/theme/v2/css/tables.css` |
| `assets/theme/v2/css/theme/v2/dialogs.css` | `assets/theme/v2/css/dialogs.css` |

## Duplicate Module Collision Handling

`assets/theme/v2/css/colors.css` and `assets/theme/v2/css/controls.css` already existed as support modules for the active `styles.css` bundle. To preserve existing `styles.css` behavior while moving the core Theme V2 modules to the requested root CSS folder:

- Existing `assets/theme/v2/css/colors.css` was moved to `assets/theme/v2/css/site-colors.css`.
- Existing `assets/theme/v2/css/controls.css` was moved to `assets/theme/v2/css/site-controls.css`.
- `assets/theme/v2/css/styles.css` now imports `site-colors.css` and `site-controls.css`.
- The moved core Theme V2 `theme.css` imports the moved core `colors.css` and `controls.css`.

This was a path normalization only; no new CSS selectors or visual rules were authored.

## Reference Updates

Updated active stylesheet references from:

`assets/theme/v2/css/theme/v2/theme.css`

to:

`assets/theme/v2/css/theme.css`

Updated:

- Root page/template references.
- Account/Admin/Company page references.
- Active tool page references.
- `toolbox/dev/checkStyleSystemGuard.mjs`.
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`.

## Styles Bundle Nav Parity

Pages that consume `assets/theme/v2/css/styles.css`, including `marketplace/index.html`, also use the shared header partial. The `styles.css` path previously opened every descendant `.sub-menu` on top-level Toolbox hover, which caused nested Objects/Worlds popouts to expand incorrectly.

`assets/theme/v2/css/gamefoundrystudio.css` now uses direct-child submenu expansion and explicit nested popout rules so:

- Hovering Toolbox opens only the first-level Toolbox menu.
- Hovering Objects opens the Objects submenu.
- Hovering Worlds opens the Worlds submenu.
- Hovering Worlds closes the Objects submenu.

## Validation Notes

- PASS: `assets/theme/v2/css/theme/v2/` no longer exists.
- PASS: No active references remain to `assets/theme/v2/css/theme/v2`.
- PASS: Theme V2 core CSS imports resolve from `assets/theme/v2/css/`.
- PASS: Tool-specific CSS remains under `assets/theme/v2/css/tools/`.
- PASS: Grouping CSS remains under `assets/theme/v2/css/tools/grouping/`.
- PASS: Font Awesome CSS remains under `assets/theme/v2/fonts/fontawesome/css/`.
- PASS: Marketplace Toolbox nested menu hover behavior validates in Playwright.
