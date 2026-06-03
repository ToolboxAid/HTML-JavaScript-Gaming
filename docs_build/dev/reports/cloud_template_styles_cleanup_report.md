# PR_26154_025 Cloud Template Styles Cleanup Report

## Baseline

Baseline used: `PR_26154_024-localization-template-rebuild`.

The PR024 baseline left:

- `toolbox/cloud/index.html` as a display-only page.
- Active `styles.css` references on public pages, active toolbox pages, and the active tool template.
- Template consistency counts at 28/43 matching public/root pages and 19/20 matching active toolbox pages.

## Cloud Template Correction

`toolbox/cloud/index.html` is now treated as an active tool page and was normalized to the `toolbox/_tool_template-v2/` structure.

Cloud now includes:

- Root `<base href="/">` template wiring.
- Theme V2 `theme.css` entry point.
- Shared header/footer partials.
- Required `tool-workspace` shell.
- Required left tool column.
- Required center panel.
- Required right tool column.
- Required `data-tool-display-mode` host.
- Required `tool-display-mode.js` script.
- Cloud-specific ToolDisplayMode metadata using `cloud-studio` badge and character assets.

Visible Cloud content preserved where it fits the template:

- Cloud page title and description.
- Connected storage, sync, versioning, and publishing support language.
- Cloud preview image in the center panel.

No custom Cloud behavior, local CSS, local JavaScript, or page-local styling was added.

## Styles.css Active Reference Cleanup

Active pages and templates were moved away from `assets/theme/v2/css/styles.css`.

Actions:

- Replaced remaining public/root `styles.css` links with `theme.css`.
- Removed duplicate `styles.css` links from active toolbox pages that already had `theme.css`.
- Removed the `styles.css` link from `toolbox/_tool_template-v2/index.html`.
- Removed the `styles.css` link from `toolbox/localization/index.html` as shared reference cleanup from the PR024 rebuilt template.
- Confirmed zero active HTML references remain to `assets/theme/v2/css/styles.css`.

`assets/theme/v2/css/styles.css` was retained. It has no active consumers, but deprecated `old-tools/` pages and historical reports still reference it. Keeping it avoids breaking deprecated/reference surfaces in this PR while removing it from active runtime/page/template/tool consumption.

## Reusable Theme V2 CSS Promotion

The reusable styling needed to let active pages consume `theme.css` directly was promoted into approved Theme V2 modules:

- `assets/theme/v2/css/spacing.css`: added tool shell and page hero sizing tokens.
- `assets/theme/v2/css/colors.css`: added semantic `meaning-*` variables/classes and tool column header color variants.
- `assets/theme/v2/css/layout.css`: added `page-hero`, `tool-workspace`, column placement, ToolDisplayMode placement, and focus-mode layout rules.
- `assets/theme/v2/css/panels.css`: added `feature-image`, tool column panel, compact tool column header sizing, tool center panel, and ToolDisplayMode panel rules.
- `assets/theme/v2/css/accordion.css`: added `accordion-stack` and horizontal accordion toggle rules used by ToolDisplayMode column collapse behavior.

No page-local CSS, tool-local CSS, inline CSS, duplicate CSS file, or new CSS file was created.

## Remaining Template Pressure

Remaining public/root mismatches:

- `admin/controls.html`: missing standard `page-title`; still uses an intentional `controls-hero` structure.
- `company/about.html`: missing standard `page-title`; still uses an intentional `about-hero` structure.

These were not rewritten because the expected template replacement is not clear enough for a safe cleanup PR.

Remaining active toolbox mismatches:

- None.

## Validation

- PASS: targeted Cloud checks for `data-tool-display-mode`, ToolDisplayMode metadata, `tool-workspace`, left/center/right panels, `tool-display-mode.js`, `styles.css`, and `theme.css`.
- PASS: zero active HTML references remain to `assets/theme/v2/css/styles.css`.
- PASS: `assets/theme/v2/css/theme.css` and changed approved CSS module imports resolve.
- PASS: tool column header `h2`/`h3` sizing is restored to the previous compact `16px` value through `var(--font-size-base)`.
- PASS: template consistency audit rerun.
- PASS: `npm run test:workspace-v2`.
- PASS: static validation for changed HTML, CSS, JSON, JavaScript, and Markdown files.
- PASS: `git diff --check`.
- SKIPPED: tests against `old-tools/`, `old_games/`, and `old_samples` per request.
- SKIPPED: full samples smoke test per request.
