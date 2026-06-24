# PR_26175_ALFA_047-theme-v2-svg-icon-registry

## Purpose
Create a shared Theme V2 SVG icon asset registry and authoritative validation specification so toolbox and platform UI can use approved standalone SVG files from one repo-owned source instead of page-local SVG, ad hoc CSS drawings, Font Awesome glyphs, conversation screenshots, vague row references, CSS-only generation, or a JS-only registry.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_047-theme-v2-svg-icon-registry`.

## Exact Scope
- Remove the incorrect JS-only icon registry implementation from the ALFA_047 delta.
- Use the user-authored SVG files already present under `assets/theme-v2/svg/` as the authoritative source.
- Do not regenerate, redesign, simplify, optimize, or redraw any SVG icon artwork in this PR.
- Required SVG files:
  - `gfs-chevron-left.svg`
  - `gfs-chevron-right.svg`
  - `gfs-chevron-up.svg`
  - `gfs-chevron-down.svg`
  - `gfs-add.svg`
  - `gfs-subtract.svg`
  - `gfs-trash.svg`
  - `gfs-close.svg`
  - `gfs-warning.svg`
  - `gfs-error.svg`
  - `gfs-success.svg`
  - `gfs-info.svg`
  - `gfs-fullscreen.svg`
  - `gfs-exit-fullscreen.svg`
  - `gfs-menu.svg`
  - `gfs-search.svg`
  - `gfs-settings.svg`
- Validate each required SVG is well-formed XML.
- Validate each SVG uses `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, and `stroke-linejoin="round"`.
- Do not create `expand` or `collapse` icon naming.
- Do not create `delete` icon naming.
- Do not replace the standalone SVG assets with a JS-only icon registry.
- Do not replace the standalone SVG assets with CSS-only icon generation.
- Create `docs_build/design/theme-v2-icons/theme-v2-icon-style-guide.md` as the authoritative specification for all future Theme V2 SVG icons.
- Create or update `assets/theme-v2/svg/README.md` as the registry documentation for the authoritative SVG asset pack.
- Document the approved validation rules and the no-regeneration/no-redesign policy.
- If any required SVG is missing, report validation failure instead of generating a replacement.
- Do not convert existing UI controls in this PR.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `assets/theme-v2/svg/gfs-chevron-left.svg`
- `assets/theme-v2/svg/gfs-chevron-right.svg`
- `assets/theme-v2/svg/gfs-chevron-up.svg`
- `assets/theme-v2/svg/gfs-chevron-down.svg`
- `assets/theme-v2/svg/gfs-add.svg`
- `assets/theme-v2/svg/gfs-subtract.svg`
- `assets/theme-v2/svg/gfs-trash.svg`
- `assets/theme-v2/svg/gfs-close.svg`
- `assets/theme-v2/svg/gfs-warning.svg`
- `assets/theme-v2/svg/gfs-error.svg`
- `assets/theme-v2/svg/gfs-success.svg`
- `assets/theme-v2/svg/gfs-info.svg`
- `assets/theme-v2/svg/gfs-fullscreen.svg`
- `assets/theme-v2/svg/gfs-exit-fullscreen.svg`
- `assets/theme-v2/svg/gfs-menu.svg`
- `assets/theme-v2/svg/gfs-search.svg`
- `assets/theme-v2/svg/gfs-settings.svg`
- `assets/theme-v2/svg/README.md`
- `docs_build/design/theme-v2-icons/theme-v2-icon-style-guide.md`
- `tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_047-theme-v2-svg-icon-registry_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_047-theme-v2-svg-icon-registry_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_047-theme-v2-svg-icon-registry_requirements-checklist.md`
- `docs_build/dev/reports/PR_26175_ALFA_047-theme-v2-svg-icon-registry_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Evidence Sources
- `docs_build/pr/PLAN_PR_26175_ALFA_047-theme-v2-svg-icon-registry.md`
- `assets/theme-v2/images/gfs-chevron-down.svg`
- `assets/theme-v2/images/gfs-chevron-up.svg`

## Out Of Scope
- No chevron conversion.
- No status/action icon conversion.
- No layout utility icon conversion.
- No JS-only icon registry.
- No CSS-only icon generation.
- No Theme V2 CSS changes.
- No runtime UI conversion.
- No accordion conversion.
- No Font Awesome removal.
- No broad visual redesign.
- No page-local CSS.
- No inline styles.
- No style blocks.
- No browser-owned product data as source of truth.
- No API/service/repository contract changes.
- No engine core changes.
- No `start_of_day` folder changes.

## Validation
Run exactly:

```powershell
npx playwright test tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs --workers=1
rg -n "<[s]tyle|[s]tyle=" docs_build/design/theme-v2-icons/theme-v2-icon-style-guide.md tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_047-theme-v2-svg-icon-registry_delta.zip
```
