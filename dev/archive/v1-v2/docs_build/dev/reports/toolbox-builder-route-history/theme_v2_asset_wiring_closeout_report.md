# PR_26154_035 Theme V2 Asset Wiring Closeout

Baseline used: `PR_26154_034-toolbox-inventory-convergence`.

## Scope

- Audited `assets/theme-v2/css`, `assets/theme-v2/fonts`, `assets/theme-v2/images`, `assets/theme-v2/js`, and `assets/theme-v2/partials`.
- Confirmed active Theme V2 references resolve.
- Confirmed Font Awesome wiring.
- Checked retired path references.

## CSS

| Asset | Status | Notes |
| --- | --- | --- |
| `assets/theme-v2/css/theme.css` | Active | Public/root pages and toolbox pages use this as the Theme V2 entry point. |
| `assets/theme-v2/css/accordion.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/base.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/buttons.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/colors.css` | Active via `theme.css` | Owns active color, meaning, swatch, and tool-group variables. |
| `assets/theme-v2/css/controls.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/dialogs.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/forms.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/layout.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/panels.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/spacing.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/status.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/tables.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/tools.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/typography.css` | Active via `theme.css` | Imported by the active entry point. |
| `assets/theme-v2/css/styles.css` | Unwired aggregate | No active page depends on it. It was reported only and left in place. |
| `assets/theme-v2/css/site-colors.css` | Unwired except through `styles.css` | Retained as aggregate-era residue. |
| `assets/theme-v2/css/site-controls.css` | Unwired except through `styles.css` | Retained as aggregate-era residue. |
| `assets/theme-v2/css/gamefoundrystudio.css` | Unwired except through `styles.css` | Retained as aggregate-era residue. |
| `assets/theme-v2/css/pages.css` | Unwired except through `styles.css` | Retained as aggregate-era residue. |
| `assets/theme-v2/css/tokens.css` | Unwired except through `styles.css` | Retained as aggregate-era residue. |
| `assets/theme-v2/css/tools/grouping/*.css` | Unwired except through `styles.css` | Group color variables are active through `colors.css`; the grouping files are retained for later consolidation/deletion review. |

## Fonts

- PASS: Font Awesome is wired from `assets/theme-v2/fonts/fontawesome` through `assets/theme-v2/css/theme.css`.
- The active import is `@import url("../fonts/fontawesome/css/font-awesome.min.css");`.
- No active page links a different Font Awesome path.
- No active `.fa-*` class consumers were found outside the Font Awesome stylesheet itself; the library is globally wired but lightly or not directly consumed.

## JavaScript

| Asset | Status | Notes |
| --- | --- | --- |
| `assets/theme-v2/js/gamefoundry-partials.js` | Active | Loaded by public/root pages, games index/type pages, active toolbox pages, and templates. |
| `assets/theme-v2/js/tool-display-mode.js` | Active | Loaded by active toolbox pages and `toolbox/_tool_template-v2/index.html`. |
| `assets/theme-v2/js/account-controls.js` | Active | Loaded by `admin/controls.html`. |

## Partials

| Asset | Status | Notes |
| --- | --- | --- |
| `assets/theme-v2/partials/header-nav.html` | Active | Loaded by `gamefoundry-partials.js`. |
| `assets/theme-v2/partials/footer.html` | Active | Loaded by `gamefoundry-partials.js`. |
| `assets/theme-v2/partials/page-shell.html` | Unwired | No active loader mapping or page reference found. |
| `assets/theme-v2/partials/tool-shell.html` | Unwired | No active loader mapping or page reference found. |

## Images

Active image groups:

- Root/brand images used by active pages: `game-foundry-studio-logo.png`, `game-foundry-mascot-sheet.png`, `game-foundry-tools-poster.png`, `forge-bot-single.png`, `logo-mark.svg`, `spark.png`, `pixel-smith.png`, `forgebot.png`, and `foundry-bot.png`.
- Tool index images used by active toolbox and public pages: active `images/tools/*.png` entries for AI Assistant, Cloud, Localization, Publish, Storage Inspector, MIDI, Sound, Palette Manager, Input, Animation, Assets, Code, Object Vector, Settings, Game Builder, Game Design, Particles, World Vector, Arcade, Learn, and Marketplace.
- ToolDisplayMode badge/character images are dynamically resolved from `assets/theme-v2/images/badges/` and `assets/theme-v2/images/characters/`.

Reported unwired image candidates:

- `images/ChatGPT Image May 30, 2026, 07_57_30 PM.png`
- `images/ChatGPT Image May 30, 2026, 07_57_30 PM2.png`
- `images/forge-bot.svg`
- `images/magic-panel.png`
- `images/toolboxaid-header.png`
- `images/icons/*`
- typo/variant tool images such as `images/tools/localizaton.png` and `images/tools/match_format.png`

These were reported only because this PR did not request asset deletion.

## Retired Path Checks

- PASS: active checked files have zero references to `assets/theme/v2`.
- PASS: active checked files have zero references to `assets/theme-v2/assets`.
- PASS: active checked files have zero references to `assets/theme-v2/css/styles.css`.
- PASS: active checked files have zero references to `favicon.ico`.
- PASS: active Theme V2 file references resolve on disk.
